import { Site } from "../enums/site";
import { RawFile } from "../types/raw-file";
import { ReplayEventV001 } from "../types/replay/replay-event-v-0-0-1";
import { ReplayEventV100 } from "../types/replay/replay-event-v-1-0-0";
import { ReplayFile } from "../types/replay/replay-file";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";
import { ItemsConfig } from "../types/navbar/items-config";
import { NamedBlob } from "../types/named-blob";
import { ReplayEvent } from "../types/replay/replay-event";
import * as JSZip from "jszip";

const pathRex: RegExp = /^(([^\/]*\/)*)([\w-]+(_[\d]{14}\.[jJ][sS][oO][nN]))$/;
const fileNameRex: RegExp = /^([\w-]+(_[\d]{14}\.[jJ][sS][oO][nN]))$/;

export class NavbarFileSelect extends NavbarItem {
    private filesChangePromise: Promise<void> | null;
    private fileSavePromise: Promise<void> | null;
    constructor(items: NavbarItemsService) {
        super(items);
        this.filesChangePromise = null;
        this.fileSavePromise = null;
    }

    public filesChange(input: FileList | Array<NamedBlob> | null, folder: boolean = false): void {
        this.filesChangePromise = this.filesChangeAsync(input, folder, this.filesChangePromise);
    }

    public filesSave(zip: boolean, list: Array<ReplayFile>) {
        this.fileSavePromise = this.fileSaveAsync(zip, list, this.fileSavePromise);
    }

    private async filesChangeAsync(input: FileList | Array<NamedBlob> | null, folder: boolean, previousFilesChangePromise: Promise<void> | null): Promise<void> {
        if (previousFilesChangePromise != null) await previousFilesChangePromise;
        let inputFiles: Array<File | NamedBlob> = Array.from(input ?? []);
        if (inputFiles.length > 0) {
            let rawFiles: Array<RawFile> = [];
            let previousConfig: ItemsConfig = this.items.loadingConfig('');
            try {
                if (!folder) {
                    if (inputFiles[0].name.toLowerCase().endsWith('.zip')) {
                        this.items.loading.text = inputFiles[0].name;
                        rawFiles = await mapZippedFiles(inputFiles[0]);
                    }
                    else if (inputFiles[0].name.toLowerCase().endsWith('.json')) {
                        rawFiles = [{
                            name: inputFiles[0].name,
                            path: '',
                            getString: async (): Promise<string> => readFileOrBlobAsText(inputFiles[0])
                        }];
                    }
                }
                else {
                    rawFiles = mapFiles(inputFiles);
                }
            }
            catch (exc) {
                console.error("Error: ", exc);
                rawFiles = [];
            }

            let replayFiles: Array<ReplayFile> | null = null;
            if (rawFiles.length > 0) {
                replayFiles = await this.loadFiles(rawFiles);
            }
            this.items.setConfig(previousConfig);
            if (replayFiles != null) {
                this.items.fileList.list = replayFiles;
            }
        }
    }

    private async fileSaveAsync(zip: boolean, list: Array<ReplayFile>, previousFileSavePromise: Promise<void> | null): Promise<void> {
        if (previousFileSavePromise != null) await previousFileSavePromise;
        if (zip) {
            list.forEach((file: ReplayFile): void => {
                let fileNameRexed = file.fileName.match(fileNameRex);
                if (fileNameRexed == null) {
                    file.fileName = file.channelName + '_' + getReplayDateStr(file.start) + '.json';
                }
            });
        }
        let blobs: Array<NamedBlob> = list.map((file: ReplayFile) => {
            let latestJson: any = replayFileToLatest(file);
            let jsonText: string = JSON.stringify(latestJson);
            return jsonTextToNamedBlob(jsonText, (zip ? file.filePath : ''), file.fileName);
        });
        if (zip) {
            let zip: JSZip = new JSZip();
            for (const blob of blobs) {
                zip.file(blob.name, blob);
            }
            let prevConf: ItemsConfig = this.items.loadingConfig('new zip file');
            let zipBlob: Blob = await zip.generateAsync(
                { type: 'blob' },
                (meta: { percent: number }): void => {
                    let rounded = Math.round(meta.percent * 100) / 100;
                    this.items.loading.text = `new zip file ${rounded}%`;
                }
            );
            downloadBlob(zipBlob, 'replay_edited.zip');
            list.forEach((file: ReplayFile): void => { file.edited = false; })
            this.items.setConfig(prevConf);
        }
        else {
            downloadBlob(blobs[0], list[0].fileName);
            list[0].edited = false;
        }
    }

    async loadFiles(rawFiles: Array<RawFile>): Promise<Array<ReplayFile>> {
        let res: Array<ReplayFile> = [];
        for (let rawFile of rawFiles) {
            try {
                this.items.loading.text = rawFile.name;
                let json: any = JSON.parse(await rawFile.getString());
                let latestJson: any = upgardeToLatest(json);
                let file: ReplayFile = latestToReplayFile(latestJson, rawFile.name, rawFile.path);
                res.push(file);
            } catch (exc) {
                console.error('Error loading', rawFile.name, exc);
            }
        }
        res.sort((a, b) => {
            let aName: string = (a.name !== '' ? a.name : a.channelName);
            let bName: string = (b.name !== '' ? b.name : b.channelName)
            return ('' + aName).localeCompare(bName);
        });
        return res;
    }
}

async function mapZippedFiles(zipFile: File | NamedBlob): Promise<Array<RawFile>> {
    return Object.entries((await JSZip.loadAsync(zipFile)).files).reduce(
        (filtered: Array<RawFile>, [path, file]: [string, JSZip.JSZipObject]) => {
            if (!file.dir) {
                let pathRexed = path.match(pathRex);
                if (pathRexed != null) {
                    filtered.push({
                        name: pathRexed[3],
                        path: pathRexed[1],
                        getString: async (): Promise<string> => await file.async('string')
                    });
                }
            }
            return filtered;
        }, []
    );
}

function mapFiles(files: Array<File | NamedBlob>): Array<RawFile> {
    return files.reduce(
        (filtered: Array<RawFile>, file: File | NamedBlob) => {
            let path: string = (file as any).webkitRelativePath ?? file.name;
            let pathRexed = path.match(pathRex);
            if (pathRexed != null) {
                filtered.push({
                    name: pathRexed[3],
                    path: pathRexed[1],
                    getString: async (): Promise<string> => await readFileOrBlobAsText(file)
                });
            }
            return filtered;
        }, []
    );
}

function readFileOrBlobAsText(obj: File | NamedBlob): Promise<string> {
    if (obj instanceof File) {
        return new Promise((resolve, reject) => {
            var r = new FileReader();
            r.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target == null) reject(new Error('targer null'));
                else if (typeof e.target.result !== 'string') reject(new Error('target.result is not string'));
                else {
                    resolve(e.target.result);
                }
            }
            r.onerror = (e: ProgressEvent<FileReader>) => reject(e.target?.error);
            r.readAsText(obj, 'UTF-8');
        });
    }
    else {
        return obj.text();
    }
}

function upgardeToLatest(json: any): any {
    const notReplay = 'Not a replay file';
    const emptyFile = 'Empty replay file';
    const unknownVersion = 'Unknown replay file version';
    if (json != null) {
        if (json.replayFileType !== 'data' || typeof json.replayFileVersion !== 'string') {
            if (typeof json.channelPath === 'string' && typeof json.channelName === 'string' && json.eventsLog instanceof Array) {
                json.replayFileType = 'data';
                json.replayFileVersion = '0.0.1';
            }
            else throw new Error(notReplay);
        }

        switch (json.replayFileVersion) {
            case '0.0.1':
                json.eventsLog = convertEventsV001ToV100(json.eventsLog as Array<ReplayEventV001>);
                json.replayFileVersion = '1.0.0';
                json.upgradedFrom = '0.0.1';
                return upgardeToLatest(json);
                break;
            case '1.0.0':
                if (typeof json.channelName === 'string' && json.eventsLog instanceof Array) {
                    let events: Array<ReplayEventV100> = json.eventsLog as Array<ReplayEventV100>;
                    if (events.length === 0) throw new Error(emptyFile);
                    for (let i = 0; i < events.length; i++) {
                        let event: ReplayEventV100;
                        //Old caputres fixes;
                        if (events[i] == null)
                            event = events[i] = { type: 'unknownEvent', time: 0, data: [] };
                        else event = events[i];

                        if (event.data == null) {
                            event.data = [];
                        }
                        if (typeof event.type !== 'string') {
                            event.type = 'unknownEvent';
                        }
                        if (!(event.data instanceof Array)) {
                            event.data = [event.data];
                        }
                    }
                    json.name = '';
                    json.start = events[0].time;
                    json.end = events[events.length - 1].time;
                    json.site = Site.CyTube;
                    json.replayFileVersion = '1.1.0';
                    if (typeof json.upgradedFrom !== 'string') json.upgradedFrom = '1.0.0';
                    return upgardeToLatest(json);
                }
                else throw new Error(notReplay);
                break;
            case '1.1.0':
                if (
                    typeof json.name === 'string' && typeof json.start === 'number' && typeof json.end === 'number' &&
                    typeof json.channelPath === 'string' && typeof json.channelName === 'string' && json.eventsLog instanceof Array &&
                    Object.values(Site).includes(json.site)
                ) {
                    return json;
                }
                else throw new Error(notReplay);
                break;
            default:
                throw new Error(unknownVersion)
                break;
        }
    }
    else throw new Error(notReplay);
}

function convertEventsV001ToV100(v001: Array<ReplayEventV001>): Array<ReplayEventV100> {
    return v001.map((event: ReplayEventV001): ReplayEventV100 => {
        if (typeof event.time === 'number' && typeof event.type === 'string' && typeof event.event === 'string' && event.data instanceof Array) {
            return {
                time: event.time,
                type: event.event,
                data: event.data
            };
        }
        else {
            throw new Error("v0.0.1: Wrong format");
        }
    });
}

function jsonTextToNamedBlob(jsonText: string, filePath: string, fileName: string): NamedBlob {
    fileName = filePath + '/' + fileName;
    fileName = fileName.split('\\').join('/').split('/').filter((s: string) => s !== '').join('/');
    let blob: NamedBlob = new Blob([jsonText], { 'type': 'application/json' }) as NamedBlob;
    blob.name = fileName;
    return blob;
}

function downloadBlob(blob: Blob, fileName: string) {
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.setAttribute("download", fileName);
    a.click();
    window.URL.revokeObjectURL(a.href);
}
function getReplayDateStr(start: number) {
    let d: Date;
    try {
        d = new Date(start);
        if (isNaN(d.getTime())) throw new Error("Invalid date");
    }
    catch (e) {
        d = new Date();
    }
    return `${d.getFullYear()}${pfx(d.getMonth() + 1)}${pfx(d.getDate())}${pfx(d.getHours())}${pfx(d.getMinutes())}${pfx(d.getSeconds())}`;
}

function pfx(num: number | string): string {
    return num.toString().padStart(2, '0');
}

function latestToReplayFile(json: any, fileName: string, filePath: string): ReplayFile {
    let events: Array<ReplayEvent> = (json.eventsLog as Array<ReplayEventV100>).map(
        (e: ReplayEventV100, uid: number): ReplayEvent => Object.assign(e, { uid })
    );
    let fileVersion: string = json.replayFileVersion as string;
    let channelName: string = json.channelName as string;
    let channelPath: string = json.channelPath as string;
    let site: Site = json.site as Site;
    let start: number = json.start as number;
    let end: number = json.end as number;
    let name: string = json.name as string;
    let upgradedFrom: string | null = null;
    if (typeof json.upgradedFrom === 'string') upgradedFrom = json.upgradedFrom as string;
    return {
        fileName, filePath, fileVersion, site, channelName, channelPath, name, start, end, upgradedFrom, edited: false, nextUid: events.length, events
    };
}

function replayFileToLatest(file: ReplayFile): any {
    let eventsLog: Array<ReplayEventV100> = (file.events.map(
        (e: ReplayEvent): ReplayEventV100 => ({ time: e.time, type: e.type, data: e.data })
    ));
    let replayFileVersion: string = file.fileVersion;
    let replayFileType: string = 'data';
    let channelName: string = file.channelName;
    let channelPath: string = file.channelPath;
    let site: Site = file.site;
    let start: number = file.start;
    let end: number = file.end;
    let name: string = file.name;
    return {
        eventsLog, replayFileType, replayFileVersion, channelName, channelPath, site, start, end, name
    };
}