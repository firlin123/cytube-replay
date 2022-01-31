export type ReplayPostMessage = {
    type: 'replayWindowLoaded';
    origin: string;
} | {
    type: 'replayEmit';
    key: string;
    payload?: any;
    callbackId?: number;
}
