import { Site } from "../../enums/site";
import { ReplayEvent } from "./replay-event";

export type ReplayFile = {
    fileName: string;
    filePath: string;
    fileVersion: string;
    upgradedFrom: string | null;
    site: Site
    channelName: string;
    channelPath: string;
    name: string;
    start: number;
    end: number;
    edited: boolean;
    nextUid: number;
    events: Array<ReplayEvent>;
}
