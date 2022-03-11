import { Emit } from "./replay-post-message/emit";
import { Event } from "./replay-post-message/event";
import { EventPack } from "./replay-post-message/event-pack";
import { PausedChange } from "./replay-post-message/paused-change";
import { SpeedXChange } from "./replay-post-message/speed-x-change";
import { WindowLoaded } from "./replay-post-message/window-loaded";

export type ReplayPostMessage = WindowLoaded | Emit | Event | EventPack | SpeedXChange | PausedChange
