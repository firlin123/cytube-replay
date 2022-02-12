export type ReplayPostMessage = {
    type: 'replayWindowLoaded';
    origin: string;
} | {
    type: 'replayEmit';
    key: string;
    payload?: any;
    callbackId?: number;
} | {
    type: 'replayEvent';
    key: string;
    data: Array<any>;
} | {
    type: 'replaySpeedXChange';
    speedX: number;
} | {
    type: 'replayPausedChange';
    paused: boolean;
}
