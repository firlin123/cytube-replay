import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReplayState } from '../classes/replay-state';
import { Site } from '../enums/site';
import { ReplayEvent } from '../types/replay/replay-event';
import { ReplayFile } from '../types/replay/replay-file';
import { ReplayPostMessage } from '../types/replay/replay-post-message';
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarSkipToItem } from '../types/navbar-skip-to-item';
import { ReplayFrameControl } from '../classes/replay-frame-control';
import { CancelableDelay } from '../classes/cancelable-delay';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {
  private file?: ReplayFile;
  private playing: boolean;
  private currentI: number;
  private timeOffset: number;
  private selectedFileSubscription?: Subscription;
  private playPauseSubscription?: Subscription;
  private replayState?: ReplayState;
  private speedXSubscription?: Subscription;
  private skipToTimeSubscription?: Subscription;
  private skipToCustomTimeSubscription?: Subscription;
  private playThreadPromise?: Promise<void>;

  private delay: CancelableDelay;
  private fileLoadPromise: Promise<void> | null;
  private skipOffset: number;
  frameControl: ReplayFrameControl;



  constructor(private navItems: NavbarItemsService) {
    this.skipOffset = 0;
    this.fileLoadPromise = null;
    this.delay = new CancelableDelay();
    this.playing = false;
    this.currentI = 0;
    this.timeOffset = 0;
    this.speedX = 1;
    this.navItems.hideAll();
    this.frameControl = new ReplayFrameControl(false);
    this.frameControl.replayMessageReceived.subscribe((msg) => {
      console.log("msg", msg);
    })
  }
  public ngOnInit(): void {
    this.navItems.hideAllExcept([this.navItems.fileList, this.navItems.fileSelect]);
    if (this.navItems.fileList.selected != null) {
      this.changeFile(this.navItems.fileList.selected);
    }
    this.selectedFileSubscription = this.navItems.fileList.selectedChanges.subscribe((file: ReplayFile): void => { this.changeFile(file); });
    this.speedXSubscription = this.navItems.speedX.valueChanges.subscribe((speedX: number) => { this.changeSpeedX(speedX); });
  }
  private async changeSpeedX(speedX: number) {
    if (this.playing) {
      await this.pause(false);
      this.play(false);
    }
    this.frameControl.sendReplayMessage({ type: "replaySpeedXChange", speedX });
  }
  public ngOnDestroy(): void {
    if (this.playing) this.pause();
    this.unsubFromEvents();
    this.navItems.skipTo.file = undefined;
  }
  private unsubFromEvents(): void {
    this.selectedFileSubscription?.unsubscribe();
    this.playPauseSubscription?.unsubscribe();
    this.speedXSubscription?.unsubscribe();
    this.skipToTimeSubscription?.unsubscribe();
    this.skipToCustomTimeSubscription?.unsubscribe();
  }
  private async changeFile(file: ReplayFile): Promise<void> {
    let prevFileLoadPromise: Promise<void> | null = this.fileLoadPromise;
    this.fileLoadPromise = new Promise<void>(async (resolve: () => void): Promise<void> => {
      if (prevFileLoadPromise != null) {
        await prevFileLoadPromise;
      }
      try {
        if (this.playing) await this.pause();
        this.skipOffset = 0;
        this.currentI = 0;
        this.timeOffset = 0;
        this.delay = new CancelableDelay();
        this.speedX = 1;
        this.replayState = new ReplayState();

        this.navItems.loadingPreset(file.name);
        file = await this.replayState.prepareFile(file, this.navItems.loading);
        await this.frameControl.loadReplayFrame(file);
        if (this.playPauseSubscription == null) {
          this.playPauseSubscription = this.navItems.playPause.clicked.subscribe((v: boolean): void => {
            if (this.playing) this.pause();
            else this.play();
          });
        }
        this.navItems.skipTo.file = file;
        this.navItems.skipTo.currentI = this.currentI;
        if (this.skipToTimeSubscription == null) {
          this.skipToTimeSubscription = this.navItems.skipTo.skipToTimeChanges.subscribe((skipToTime: number) => {
            this.skipToTime(skipToTime);
          });
        }
        if (this.skipToCustomTimeSubscription == null) {
          this.skipToCustomTimeSubscription = this.navItems.skipTo.skipCustomTimeChanges.subscribe((skipCustomTime: number) => {
            this.skipCustomTime(skipCustomTime);
          });
        }
        this.navItems.mainPreset();
        this.file = file;
      }
      catch (err) {
        console.log('Change file error:', err);
      }
      resolve();
    });
    await this.fileLoadPromise;
  }

  private async skipToTime(skipToEventTime: number): Promise<void> {
    if (this.file != null) {
      console.log("skip to", skipToEventTime);
      await this.setSkipOffset(skipToEventTime - this.file.events[this.currentI].time);
    }
  }

  private async skipCustomTime(skipFor: number) {
    if (this.file != null) {
      console.log("skip for", skipFor);
      await this.setSkipOffset(skipFor);
    }
  }

  private async setSkipOffset(skipOffset: number): Promise<void> {
    let wasPlaying: boolean = this.playing;
    if (this.playing) {
      await this.pause(false);
    }
    this.skipOffset = skipOffset;
    if (wasPlaying) {
      this.play(false);
    }
  }

  private async pause(sendToFrame: boolean = true): Promise<void> {
    if (this.file != null && this.playing) {
      this.playing = false;
      if (sendToFrame) {
        this.navItems.playPause.paused = true;
        this.frameControl.sendReplayMessage({ type: "replayPausedChange", paused: true });
      }
      this.delay.cancel(); //cancel delay in playThread
      await this.playThreadPromise; //wait for the playThread to actually finish
    }
  }

  private play(sendToFrame: boolean = true): void {
    let skipOffset: number = 0;
    if (this.skipOffset > 0) {
      skipOffset = this.skipOffset;
      this.skipOffset = 0;
    }
    if (this.file != null && !(this.playing)) {
      this.timeOffset = (Date.now() + this.delay.remaining) - this.file.events[this.currentI].time - skipOffset;
      this.playing = true;
      if (sendToFrame) {
        this.navItems.playPause.paused = false;
        this.frameControl.sendReplayMessage({ type: "replayPausedChange", paused: false });
      }
      (this.playThreadPromise = this.playThread(skipOffset !== 0)).then((): void => {
        this.playThreadPromise = undefined
      });
    }
  }

  async playThread(skipping: boolean = false): Promise<void> {
    if (this.file != null && this.replayState != null) {
      console.log("playThread started");
      for (let i: number = this.currentI; i < this.file.events.length; i++) {
        this.currentI = i;
        let event: ReplayEvent = this.file.events[i];
        let eventTime: number = event.time + this.timeOffset;
        let eventDelay: number = eventTime - Date.now();
        if (eventDelay > 0 && skipping) {
          skipping = false;
          console.log("Skipping done");
        }
        if (this.speedX != 1) {
          this.timeOffset -= eventDelay - Math.floor(eventDelay / this.speedX);
          eventDelay = Math.floor(eventDelay / this.speedX);
        }
        await this.delay.start(eventDelay);
        if (this.delay.cancelled) {
          break;
        }
        else {
          this.navItems.skipTo.currentI = i;
          this.replayState.processEvent(event);
          if (typeof (globalThis as any).replayEventHook === 'function') {
            (globalThis as any).replayEventHook(this, event);
          }
          this.frameControl.sendReplayMessage({
            type: 'replayEvent',
            key: event.type,
            data: event.data
          });
        }
      }
      if (!(this.delay.cancelled)) {
        // we've reached the end of current file
        // TODO: reset currentI and change play/pause button to replay icon 
      }
      console.log("playThread stopped");
    }
  }

  /*
  private async loadReplayFrame(src: string): Promise<Window> {
    return await new Promise((
      resolve: (value: Window) => void,
      reject: (reason?: any) => void
    ): void => {
      const replayFrameNull: string = 'Replay frame content window is null';
      const replayFrameTimedOut: string = 'Replay frame load timed out. (No response)';
      this.frameLoading = true;
      let timeout: number = window.setTimeout((): void => {
        reject(new Error(replayFrameTimedOut));
      }, 5000);
      window.onmessage = (msg: MessageEvent<any>): void => {
        if (typeof msg?.data?.replayPostMessage === 'object') {
          let message: ReplayPostMessage = msg.data.replayPostMessage as ReplayPostMessage;
          if (message.type === 'replayWindowLoaded') {
            if (this.frame?.contentWindow == null) reject(new Error(replayFrameNull));
            else {
              clearTimeout(timeout);
              this.frameLoading = false;
              this.frameOrigin = message.origin;
              window.onmessage = this.frameMessage;
              resolve(this.frame?.contentWindow);
            }
          }
        }
      }
      if (this.frame == null) reject(new Error(replayFrameNull));
      else this.frame.src = src;
    });
  }
  */
  private get speedX(): number {
    return this.navItems.speedX.value;
  }
  private set speedX(value: number) {
    this.navItems.speedX.value = value;
  }
}

