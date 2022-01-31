import { ReplayEvent } from "./replay-event";

export interface ReplayFile {
    fileName: string;
    filePath: string;
    fileVersion: string;
    channelName: string;
    channelPath: string;
    name: string;
    start: number;
    end: number;
    events: Array<ReplayEvent>;
}
