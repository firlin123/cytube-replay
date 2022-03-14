import { JSZipObject, loadAsync } from "jszip";
import { Site } from "../enums/site";
import { RawFile } from "../types/raw-file";
import { ReplayEventV001 } from "../types/replay/replay-event-v-0-0-1";
import { ReplayEventV100 } from "../types/replay/replay-event-v-1-0-0";
import { ReplayFile } from "../types/replay/replay-file";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";
import { ItemsConfig } from "../types/navbar/items-config";
import { NamedBlob } from "../types/named-blob";

const pathRex: RegExp = /^(([^\/]*\/)*)([a-zA-Z\d-]+(_[\d]{14}\.[jJ][sS][oO][nN]))$/;

export class NavbarFileSelect extends NavbarItem {
    constructor(items: NavbarItemsService) {
        super(items);
    }

    public filesChange(input: FileList | Array<NamedBlob> | null, folder: boolean = false): void {
        (async (): Promise<void> => {
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
        })();
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
    return Object.entries((await loadAsync(zipFile)).files)
        .reduce((filtered: Array<RawFile>, [path, file]: [string, JSZipObject]) => {
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
        }, [])
}

function mapFiles(files: Array<File | NamedBlob>): Array<RawFile> {
    return files.reduce((filtered: Array<RawFile>, file: File | NamedBlob) => {
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
    }, []);
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

function latestToReplayFile(json: any, fileName: string, filePath: string): ReplayFile {
    let events: Array<ReplayEventV100> = json.eventsLog as Array<ReplayEventV100>;
    events.unshift({
        time: json.start,
        type: 'snowpityEvent',
        data: []
    });
    events.push({
        time: json.end,
        type: 'snowpityEvent',
        data: []
    });
    let fileVersion: string = json.replayFileVersion as string;
    let channelName: string = json.channelName as string;
    let channelPath: string = json.channelPath as string;
    let site: Site = json.site as Site;
    let start: number = json.start as number;
    let end: number = json.end as number;
    let name: string = json.name as string;
    return {
        fileName, filePath, fileVersion, site, channelName, channelPath, name, start, end, events
    };
}
