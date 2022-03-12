import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReplayState } from '../classes/replay-state';
import { ReplayEvent } from '../types/replay/replay-event';
import { ReplayFile } from '../types/replay/replay-file';
import { NavbarItemsService } from "../services/navbar-items.service";
import { ReplayFrameControl } from '../classes/replay-frame-control';
import { CancelableDelay } from '../classes/cancelable-delay';
import { SkipState } from '../types/replay-state/skip-state';
import { ReplayPostMessage } from '../types/replay/replay-post-message';
import { Emit } from '../types/replay/replay-post-message/emit';

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
  private replayMessageSubscription: Subscription;
  private selectedFileSubscription: Subscription;
  private speedXSubscription: Subscription;
  private playPauseSubscription?: Subscription;
  private skipToTimeSubscription?: Subscription;
  private skipToCustomTimeSubscription?: Subscription;
  private replayState?: ReplayState;
  private playThreadPromise?: Promise<void>;

  private delay: CancelableDelay;
  private fileLoadPromise: Promise<void> | null;
  private skipOffset: number;
  public frameControl: ReplayFrameControl;

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
    this.navItems.onlyFileSelectConfig();
    this.replayMessageSubscription = this.frameControl.replayMessageReceived.subscribe((msg: ReplayPostMessage) => { this.replayMessage(msg); });
    this.selectedFileSubscription = this.navItems.fileList.selectedChanges.subscribe((file: ReplayFile): void => { this.changeFile(file); });
    this.speedXSubscription = this.navItems.speedX.valueChanges.subscribe((speedX: number) => { this.changeSpeedX(speedX); });
    if (this.navItems.fileList.selected != null) {
      this.changeFile(this.navItems.fileList.selected);
    }
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    if (this.playing) this.pause();
    this.unsubFromEvents();
    this.navItems.skipTo.file = undefined;
  }

  private unsubFromEvents(): void {
    this.replayMessageSubscription.unsubscribe();
    this.selectedFileSubscription.unsubscribe();
    this.speedXSubscription.unsubscribe();
    this.playPauseSubscription?.unsubscribe();
    this.skipToTimeSubscription?.unsubscribe();
    this.skipToCustomTimeSubscription?.unsubscribe();
  }

  private replayMessage(msg: ReplayPostMessage) {
    switch (msg.type) {
      case "replayEmit":
        this.replayEmit(msg);
        break;
      default:
        console.log('replay msg:', msg);
    }
  }

  private replayEmit(msg: Emit) {
    switch (msg.key) {
      case "requestPlaylist":
      case "playerReady":
        if (this.replayState != null) {
          let events: Array<ReplayEvent> = this.replayState[msg.key]();
          this.frameControl.sendReplayMessage({ type: 'replayEventPack', events });
        }
        break;
      default:
        console.log("replay emit:", msg);
        break;
    }
  }

  private async changeSpeedX(speedX: number) {
    if (this.playing) {
      await this.pause(false);
      this.play(false);
    }
    this.frameControl.sendReplayMessage({ type: "replaySpeedXChange", speedX });
  }

  private async changeFile(file: ReplayFile): Promise<void> {
    let prevFileLoadPromise: Promise<void> | null = this.fileLoadPromise;
    this.fileLoadPromise = new Promise<void>(async (resolve: () => void): Promise<void> => {
      if (prevFileLoadPromise != null) {
        await prevFileLoadPromise;
      }
      try {
        this.navItems.loadingConfig(file.name !== '' ? file.name : file.channelName);
        if (this.playing) await this.pause();
        this.skipOffset = 0;
        this.currentI = 0;
        this.timeOffset = 0;
        this.delay = new CancelableDelay();
        this.speedX = 1;
        this.replayState = new ReplayState();

        file = await this.replayState.prepareFile(file, this.navItems.loading);
        this.navItems.loading.text = (file.name !== '' ? file.name : file.channelName);
        await this.frameControl.loadReplayFrame(file);
        if (this.playPauseSubscription == null) {
          this.playPauseSubscription = this.navItems.playPause.clicked.subscribe((v: boolean): void => {
            if (this.playing) this.pause();
            else this.play();
          });
        }
        this.navItems.skipTo.currentI = this.currentI;
        this.navItems.skipTo.file = file;
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
        this.navItems.readyToPlayConfig();
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
      let skipState: SkipState | null = skipping ? this.replayState.createSkipState() : null;
      for (let i: number = this.currentI; i < this.file.events.length; i++) {
        this.currentI = i;
        let event: ReplayEvent = this.file.events[i];
        let eventTime: number = event.time + this.timeOffset;
        let eventDelay: number = eventTime - Date.now();
        if (eventDelay > 0 && skipping && skipState != null) {
          skipping = false;
          this.skippingDone(this.replayState, skipState, i - 1);
        }
        if (this.speedX != 1) {
          this.timeOffset -= eventDelay - Math.floor(eventDelay / this.speedX);
          eventDelay = Math.floor(eventDelay / this.speedX);
        }
        if (skipping) {
          this.replayState.processEvent(event);
          this.eventHook(event);
        }
        else {
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
      }
      let fileEnded: boolean = false;
      if (skipping && skipState != null) {
        skipping = false;
        this.skippingDone(this.replayState, skipState, this.file.events.length - 1);
        fileEnded = true;
      }
      else if (!(this.delay.cancelled)) {
        fileEnded = true;
      }

      if (fileEnded) {
        console.log('File ended');
        this.pause();
        // we've reached the end of current file
        // TODO: reset currentI and change play/pause button to replay icon
      }
      console.log("playThread stopped");
    }
  }

  private skippingDone(replayState: ReplayState, skipState: SkipState, currentI: number): void {
    console.log("Skipping done");
    this.navItems.skipTo.currentI = currentI;
    let eventPack: Array<ReplayEvent> = replayState.getSkipStateEvents(skipState);
    replayState.removeSkipState(skipState);
    this.frameControl.sendReplayMessage({
      type: 'replayEventPack',
      events: eventPack
    });
  }
  private eventHook(event: ReplayEvent): void {
    if (typeof (globalThis as any).replayEventHook === 'function') {
      (globalThis as any).replayEventHook(this, event);
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

