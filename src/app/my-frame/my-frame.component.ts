import { Component, OnInit, OnChanges, Input, SimpleChanges, SimpleChange, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { MyFrameControl } from '../classes/my-frame-control';

@Component({
  selector: 'app-my-frame',
  templateUrl: './my-frame.component.html',
  styleUrls: ['./my-frame.component.css']
})
export class MyFrameComponent implements OnInit, OnChanges, OnDestroy {
  @Input() myFrameControl: MyFrameControl | null;
  private frame: HTMLIFrameElement | null;
  private loadingUrlPromise: Promise<Window> | null;
  private resolveLoadingUrlPromise: ((window: Window) => void) | null;
  private loadingFramePromise: Promise<HTMLIFrameElement>;
  private resolveLoadingFramePromise: ((frame: HTMLIFrameElement) => void) | null;

  constructor(private location: Location) {
    this.frame = null;
    this.myFrameControl = null;
    this.resolveLoadingUrlPromise = null;
    this.loadingUrlPromise = null;
    this.resolveLoadingFramePromise = null;
    this.loadingFramePromise = new Promise<HTMLIFrameElement>((resolve: (frame: HTMLIFrameElement) => void): void => {
      this.resolveLoadingFramePromise = (frame: HTMLIFrameElement): void => resolve(frame);
    });
  }

  ngOnDestroy(): void {
    if(this.myFrameControl != null) {
      this.myFrameControl.frameComponent = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('myFrameControl' in changes) {
      let change: SimpleChange = changes.myFrameControl;
      if (change.previousValue instanceof MyFrameControl) {
        let prevFrameControl: MyFrameControl = change.previousValue;
        prevFrameControl.frameComponent = null;
      }
      let currFrameControl: MyFrameControl = change.currentValue;
      currFrameControl.frameComponent = this;
    }
  }

  ngOnInit(): void {
  }

  onLoadFrame(frame: HTMLIFrameElement | null) {
    if (frame != null) {
      if (this.frame == null) {
        this.frame = frame;
        if (this.resolveLoadingFramePromise != null) {
          this.resolveLoadingFramePromise(frame);
        }
      }
      else if (frame.contentWindow != null) {
        this.onLoadWindow(frame.contentWindow);
      }
    }
  }

  private onLoadWindow(window: Window) {
    if (this.resolveLoadingUrlPromise != null) {
      let resolveLodingUrlPromise: (window: Window) => void = this.resolveLoadingUrlPromise;
      this.resolveLoadingUrlPromise = null;
      resolveLodingUrlPromise(window);
    }
  }

  public async loadUrl(url: string, prepareExternalUrl: boolean = true): Promise<Window> {
    let fullPath: string = prepareExternalUrl ? this.location.prepareExternalUrl(url) : url;
    let prevLoadingPromise: Promise<Window> | null = this.loadingUrlPromise;
    this.loadingUrlPromise = new Promise<Window>(async (resolve: (window: Window) => void): Promise<void> => {
      if (prevLoadingPromise != null) {
        let prevWindow: Window = await prevLoadingPromise;
      }
      let frame: HTMLIFrameElement = this.frame ?? await this.loadingFramePromise;
      this.resolveLoadingUrlPromise = (window: Window): void => resolve(window);
      frame.src = fullPath;
    });
    return await this.loadingUrlPromise;
  }
}
