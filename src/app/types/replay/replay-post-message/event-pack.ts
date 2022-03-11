import { ReplayEvent } from "../replay-event";

export type EventPack = {
    type: 'replayEventPack';
    events: Array<ReplayEvent>;
};