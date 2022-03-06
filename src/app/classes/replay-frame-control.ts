import { EventEmitter } from "@angular/core";
import { Site } from "../enums/site";
import { ReplayFile } from "../types/replay/replay-file";
import { ReplayPostMessage } from "../types/replay/replay-post-message";
import { MyFrameControl } from "./my-frame-control";

type hashArgsType = [string, string, 0 | 1, string];

export class ReplayFrameControl extends MyFrameControl {
    public readonly replayMessageReceived: EventEmitter<ReplayPostMessage>;
    private replayFrameLoaded: boolean;
    private resolveReplayFrameOriginPromise: ((origin: string) => void) | null;
    private readonly frameFakeConsoleLog: boolean;
    private origin: string | null;

    public constructor(fakeConsoleLog: boolean) {
        super();
        this.frameFakeConsoleLog = fakeConsoleLog;
        this.replayFrameLoaded = false;
        this.origin = null;
        this.resolveReplayFrameOriginPromise = null;
        this.replayMessageReceived = new EventEmitter<ReplayPostMessage>();
        this.messageReceived.subscribe((msg: MessageEvent<any>): void => {
            if (typeof msg?.data?.replayPostMessage === 'object') {
                let replayPostMessage: ReplayPostMessage = msg.data.replayPostMessage as ReplayPostMessage;
                if (replayPostMessage.type === 'replayWindowLoaded' && this.resolveReplayFrameOriginPromise != null) {
                    let resolveReplayFrameOriginPromise: (origin: string) => void = this.resolveReplayFrameOriginPromise;
                    this.resolveReplayFrameOriginPromise = null;
                    resolveReplayFrameOriginPromise(replayPostMessage.origin);
                }
                else {
                    this.replayMessageReceived.emit(replayPostMessage);
                }
            }
        });
    }

    //TODO: replay load timeout
    public async loadReplayFrame(file: ReplayFile) {
        let pageVersion: string = this.getPageVersion(file.site, file.start);
        let hashArgs: hashArgsType = [
            file.channelPath,
            file.channelName,
            this.frameFakeConsoleLog ? 1 : 0,
            window.location.origin
        ]
        let hash: string = JSON.stringify(hashArgs);
        hash = "#" + encodeURIComponent(hash.substr(1, hash.length - 2));
        let replayFrameOriginPromise: Promise<string> = new Promise<string>((resolve: (origin: string) => void): void => {
            this.resolveReplayFrameOriginPromise = (origin: string): void => resolve(origin);
        });
        await this.loadUrl('assets/' + file.site + '-iframe/v' + pageVersion + '-page.html?_' + Date.now() + hash);
        this.origin = await replayFrameOriginPromise;
    }

    private getPageVersion(site: Site, start: number): string {
        let pageVersion: string = '1';
        switch (site) {
            case Site.CyTube:
                if (start > 1645362602000) {
                    pageVersion = '4';
                }
                else if (start > 1644158271000) {
                    pageVersion = '3';
                }
                else if (start > 1643263187000) {
                    pageVersion = '2';
                }
                break;
            default:
                break;
        }
        return pageVersion;
    }

    public sendReplayMessage(message: ReplayPostMessage): void {
        if (this.origin != null) {
            this.sendMessage({ replayPostMessage: message }, this.origin);
        }
    }
}
