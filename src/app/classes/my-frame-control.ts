import { EventEmitter } from "@angular/core";
import { MyFrameComponent } from "../my-frame/my-frame.component";

export class MyFrameControl {
    private frame: MyFrameComponent | null;
    private window: Window | null;
    private framePromise: Promise<MyFrameComponent>;
    private resolveFramePromise: ((frame: MyFrameComponent) => void) | null;
    public readonly messageReceived: EventEmitter<MessageEvent<any>>;

    public constructor() {
        this.frame = null;
        this.window = null;
        this.resolveFramePromise = null;
        this.framePromise = new Promise<MyFrameComponent>((resolve: (frame: MyFrameComponent) => void): void => {
            this.resolveFramePromise = (frame: MyFrameComponent): void => resolve(frame);
        });
        this.messageReceived = new EventEmitter<MessageEvent<any>>();
        window.addEventListener("message", (msg: MessageEvent<any>): void => {
            console.log("msg", msg);
            this.messageReceived.emit(msg);
        });
    }

    public set frameComponent(frameComponent: MyFrameComponent | null) {
        this.frame = frameComponent;
        if (frameComponent != null) {
            if (this.resolveFramePromise != null) {
                let resolveFramePromise: (frame: MyFrameComponent) => void = this.resolveFramePromise;
                this.resolveFramePromise = null;
                resolveFramePromise(frameComponent);
            }
        }
        else {
            this.window = null;
        }
    }

    public async loadUrl(url: string, prepareExternalUrl: boolean = true): Promise<void> {
        let frame = this.frame ?? await this.framePromise;
        this.window = await frame.loadUrl(url, prepareExternalUrl);
    }

    public sendMessage(message: any, origin: string) {
        if (this.window != null) {
            this.window.postMessage(message, origin);
        }
    }
}
