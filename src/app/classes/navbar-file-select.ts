import { JSZipObject, loadAsync } from "jszip";
import { Site } from "../enums/site";
import { RawFile } from "../types/raw-file";
import { ReplayEventV001 } from "../types/replay/replay-event-v-0-0-1";
import { ReplayEventV100 } from "../types/replay/replay-event-v-1-0-0";
import { ReplayFile } from "../types/replay/replay-file";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";

const pathRex: RegExp = /^(([^\/]*\/)*)([a-zA-Z\d-]+(_[\d]{14}\.[jJ][sS][oO][nN]))$/;

export class NavbarFileSelect extends NavbarItem {
    constructor(items: NavbarItemsService) {
        super(items);
    }

    public filesChange(input: FileList | null, folder: boolean = false): void {
        (async (): Promise<void> => {
            let inputFiles: Array<File> = Array.from(input ?? []);
            if (inputFiles.length > 0) {
                let rawFiles: Array<RawFile> = [];
                this.items.hideAllExcept([this.items.loading]);
                try {
                    if (!folder) {
                        if (inputFiles[0].name.toLowerCase().endsWith('.zip')) {
                            this.items.loading.text = inputFiles[0].name;
                            this.items.loading.enabled = true;
                            rawFiles = await mapZippedFiles(inputFiles[0]);
                        }
                        else if (inputFiles[0].name.toLowerCase().endsWith('.json')) {
                            rawFiles = [{
                                name: inputFiles[0].name,
                                path: '',
                                getString: async (): Promise<string> => readFileAsText(inputFiles[0])
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

                if (rawFiles.length > 0) {
                    this.items.fileList.list = await this.loadFiles(rawFiles);
                }
                this.items.showAll();
                this.items.loading.enabled = false;
            }
        })();
    }

    async loadFiles(rawFiles: Array<RawFile>): Promise<Array<ReplayFile>> {
        this.items.loading.enabled = true;
        let res: Array<ReplayFile> = [];
        for (let rawFile of rawFiles) {
            try {
                this.items.loading.text = rawFile.name;
                let json: any = JSON.parse(await rawFile.getString());
                let file: ReplayFile = parseReplayFile(json, rawFile.name, rawFile.path);
                res.push(file);
            } catch (exc) {
                console.error('Error loading', rawFile.name, exc);
            }
        }
        this.items.loading.enabled = false;
        return res;
    }
}

async function mapZippedFiles(zipFile: File): Promise<Array<RawFile>> {
    return Object.entries((await loadAsync(zipFile)).files)
        .reduce((filtered: Array<RawFile>, [path, file]: [string, JSZipObject]) => {
            if (!file.dir) {
                let pathRexed = path.match(pathRex);
                if (pathRexed != null) {
                    filtered.push({
                        name: pathRexed[3],
                        path: pathRexed[1],
                        getString: async (): Promise<string> => file.async('string')
                    });
                }
            }
            return filtered;
        }, [])
}

function mapFiles(files: Array<File>): Array<RawFile> {
    return files.reduce((filtered: Array<RawFile>, file: File) => {
        let path: string = (file as any).webkitRelativePath ?? file.name;
        let pathRexed = path.match(pathRex);
        if (pathRexed != null) {
            filtered.push({
                name: pathRexed[3],
                path: pathRexed[1],
                getString: async (): Promise<string> => readFileAsText(file)
            });
        }
        return filtered;
    }, []);
}

function readFileAsText(file: File): Promise<string> {
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
        r.readAsText(file, 'UTF-8');
    });
}

function parseReplayFile(json: any, fileName: string, filePath: string): ReplayFile {
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
                return parseReplayFile(json, fileName, filePath);
                break;
            case '1.0.0':
                if (typeof json.channelName === 'string' && json.eventsLog instanceof Array) {
                    let events: Array<ReplayEventV100> = json.eventsLog as Array<ReplayEventV100>;
                    if (events.length === 0) throw new Error(emptyFile);
                    json.name = json.channelName as string;
                    json.start = events[0].time;
                    json.end = events[events.length - 1].time;
                    json.site = Site.CyTube;
                    json.replayFileVersion = '1.0.1';
                    return parseReplayFile(json, fileName, filePath);
                }
                else throw new Error(notReplay);
                break;
            case '1.0.1':
                if (
                    typeof json.name === 'string' && typeof json.start === 'number' && typeof json.end === 'number' &&
                    typeof json.channelPath === 'string' && typeof json.channelName === 'string' && json.eventsLog instanceof Array &&
                    Object.values(Site).includes(json.site)
                ) {
                    let events: Array<ReplayEventV100> = json.eventsLog as Array<ReplayEventV100>;
                    if (events.length === 0) throw new Error(emptyFile);
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
