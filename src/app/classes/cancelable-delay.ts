export class CancelableDelay {
    public cancelled: boolean;
    public remaining: number;
    private cancelDelay: (() => void) | null;
    public constructor() {
        this.cancelDelay = null;
        this.cancelled = false;
        this.remaining = 0;
    }
    public cancel() {
        if (this.cancelDelay != null) {
            this.cancelDelay();
        }
    }
    public async start(milliseconds: number): Promise<boolean> {
        this.cancelDelay = null;
        this.cancelled = false;
        this.remaining = 0;
        let startTime: number = Date.now();
        await new Promise<void>((resolve: () => void) => {
            let timeout: number = window.setTimeout(() => resolve(), milliseconds);
            this.cancelDelay = () => {
                window.clearTimeout(timeout);
                let remainingTime: number = milliseconds - (Date.now() - startTime);
                this.remaining = remainingTime < 0 ? 0 : remainingTime;
                this.cancelled = true;
                this.cancelDelay = null;
                resolve();
            };

        });
        return this.cancelled;
    }
}
