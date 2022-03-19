import { ReplayEventV100 } from "./replay-event-v-1-0-0";

export type ReplayEvent = ReplayEventV100 & {
    uid: number;
};
