import { Media } from "./media";

export type MediaState = Media & {
    currentTime: number;
    paused: boolean;
};
