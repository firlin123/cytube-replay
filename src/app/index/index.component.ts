import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReplayState } from '../classes/replay-state';
import { Site } from '../enums/site';
import { ReplayEvent } from '../types/replay/replay-event';
import { ReplayFile } from '../types/replay/replay-file';
import { ReplayPostMessage } from '../types/replay/replay-post-message';
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarSkipToItem } from '../types/navbar-skip-to-item';

type hashArgsType = [string, string, 0 | 1, string];

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {
  private readonly noop: () => void;
  private readonly frameFakeConsoleLog: boolean;
  private frame?: HTMLIFrameElement;
  private frameBaseSrc: string;
  private frameLoading: boolean;
  private frameOrigin?: string;
  private frameWin?: Window;
  private frameMessage: (msg: MessageEvent<any>) => void;
  private file?: ReplayFile;
  private playing: boolean;
  private cancelDelay: () => void;
  private currentI: number;
  private timeOffset: number;
  private remainingDelay: number;
  private selectedFileSubscription?: Subscription;
  private playPauseSubscription?: Subscription;
  private replayState?: ReplayState;
  private speedXSubscription?: Subscription;
  private skipToSubscription?: Subscription;
  private playThreadPromise?: Promise<void>;
  constructor(private navItems: NavbarItemsService) {
    this.frameLoading = false;
    this.frameBaseSrc = './assets';
    this.frameFakeConsoleLog = false;
    this.playing = false;
    this.currentI = 0;
    this.timeOffset = 0;
    this.remainingDelay = 0;
    this.speedX = 1;
    this.cancelDelay = this.noop = (): void => { };
    this.frameMessage = (msg: MessageEvent<any>) => {
      if (typeof msg?.data?.replayPostMessage === 'object') {
        this.receiveMessage(msg.data.replayPostMessage as ReplayPostMessage);
      }
    }
    this.navItems.disableAll();
  }
  private sendMessage(message: ReplayPostMessage): void {
    if (this.frameWin != null && this.frameOrigin != null) {
      this.frameWin.postMessage({ replayPostMessage: message }, this.frameOrigin);
    }
  }
  private receiveMessage(message: ReplayPostMessage): void {
    console.log('msg', message);
  }
  public ngOnInit(): void {
    this.frame = document.getElementById('replay-frame') as HTMLIFrameElement;
    this.navItems.disableAllExcept([this.navItems.fileList, this.navItems.fileSelect]);
    if (this.navItems.fileList.selected != null) {
      this.changeFile(this.navItems.fileList.selected);
    }
    this.selectedFileSubscription = this.navItems.fileList.selectedChanges.subscribe((file: ReplayFile): void => { this.changeFile(file); });
    this.speedXSubscription = this.navItems.speedX.valueChanges.subscribe((speedX: number) => { this.changeSpeedX(speedX); });
  }
  private async changeSpeedX(speedX: number) {
    if (this.playing) {
      await this.pause(true);
      this.play(true);
    }
    this.sendMessage({ type: "replaySpeedXChange", speedX });
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
    this.skipToSubscription?.unsubscribe();
  }
  private async changeFile(file: ReplayFile): Promise<void> {
    if (!this.frameLoading) {
      try {
        if (this.playing) this.pause();
        this.currentI = 0;
        this.timeOffset = 0;
        this.remainingDelay = 0;
        this.speedX = 1;
        this.replayState = new ReplayState();
        let pageVersion: string = getPageVersion(file.site, file.start);
        let hashArgs: hashArgsType = [
          file.channelPath,
          file.channelName,
          this.frameFakeConsoleLog ? 1 : 0,
          window.location.origin
        ]
        let hash: string = JSON.stringify(hashArgs);
        hash = "#" + encodeURIComponent(hash.substr(1, hash.length - 2));

        this.navItems.loading.enabled = true;
        this.navItems.loading.text = file.name;
        this.navItems.hideAllExcept([this.navItems.loading]);
        this.frameWin = await this.loadReplayFrame(this.frameBaseSrc + '/' + file.site + '-iframe/v' + pageVersion + '-page.html?_' + Date.now() + hash);
        this.playPauseSubscription?.unsubscribe();
        this.playPauseSubscription = this.navItems.playPause.clicked.subscribe((v: boolean): void => {
          if (this.playing) this.pause();
          else this.play();
        });
        this.navItems.skipTo.file = file;
        this.navItems.skipTo.currentI = this.currentI;
        this.skipToSubscription = this.navItems.skipTo.selectedChanges.subscribe((skipTo: number) => { this.changeSkipTo(skipTo); });
        this.navItems.disableAllExcept([this.navItems.playPause, this.navItems.skipTo, this.navItems.speedX, this.navItems.fileList, this.navItems.fileSelect])
        this.navItems.showAll();
        this.file = file;
      }
      catch (err) {
        console.log('Change file error:', err);
      }
    }
  }
  
  private changeSkipTo(skipTo: number) {
    console.log("skip to");
  }

  private async pause(fromSpeedXChange: boolean = false): Promise<void> {
    if (this.file != null && this.playing) {
      this.playing = false;
      if (!fromSpeedXChange) {
        this.navItems.playPause.paused = true;
        this.sendMessage({ type: "replayPausedChange", paused: true });
      }
      this.cancelDelay(); //cancel delay in playThread
      await this.playThreadPromise; //wait for the playThread to actually finish
    }
  }

  private play(fromSpeedXChange: boolean = false): void {
    if (this.file != null && !(this.playing)) {
      this.timeOffset = (Date.now() + this.remainingDelay) - this.file.events[this.currentI].time;
      this.playing = true;
      if (!fromSpeedXChange) {
        this.navItems.playPause.paused = false;
        this.sendMessage({ type: "replayPausedChange", paused: false });
      }
      (this.playThreadPromise = this.playThread()).then((): void => {
        this.playThreadPromise = undefined
      });
    }
  }

  async playThread(): Promise<void> {
    if (this.file != null && this.replayState != null) {
      console.log("playThread started");
      let delayCanceled: boolean = false;
      for (let i: number = this.currentI; i < this.file.events.length && !delayCanceled; i++) {
        this.currentI = i;
        let event: ReplayEvent = this.file.events[i];
        let eventTime: number = event.time + this.timeOffset;
        let eventDelay: number = eventTime - Date.now();
        if (this.speedX != 1) {
          this.timeOffset -= eventDelay - Math.floor(eventDelay / this.speedX);
          eventDelay = Math.floor(eventDelay / this.speedX);
        }
        delayCanceled = !(await this.delay(eventDelay));
        if (!delayCanceled) {
          this.navItems.skipTo.currentI = i;
          this.replayState.processEvent(event);
          if (typeof (globalThis as any).replayEventHook === 'function') {
            (globalThis as any).replayEventHook(this, event);
          }
          this.sendMessage({
            type: 'replayEvent',
            key: event.type,
            data: event.data
          });
        }
      }
      if (!delayCanceled) {
        // we've reached the end of current file
        // TODO: reset currentI and change play/pause button to replay icon 
      }
      console.log("playThread stopped");
    }
  }

  private async delay(duration: number): Promise<boolean> {
    return await new Promise((resolve: (value: boolean) => void): void => {
      let end: number = Date.now() + duration;
      let tout: number = window.setTimeout((): void => {
        this.remainingDelay = 0;
        this.cancelDelay = this.noop;
        resolve(true);
      }, duration);
      this.cancelDelay = (): void => {
        this.remainingDelay = end - Date.now();
        window.clearTimeout(tout);
        this.cancelDelay = this.noop;
        resolve(false);
      }
    });
  }
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
  private get speedX(): number {
    return this.navItems.speedX.value;
  }
  private set speedX(value: number) {
    this.navItems.speedX.value = value;
  }
}

function getPageVersion(site: Site, start: number): string {
  let pageVersion: string = '1';
  switch (site) {
    case Site.CyTube:
      if (start > 1644158271000) {
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