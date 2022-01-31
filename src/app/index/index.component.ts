import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReplayEvent } from '../interfaces/replay-event';
import { ReplayFile } from '../interfaces/replay-file';
import { ReplayPostMessage } from '../interfaces/replay-post-message';
import { NavbarItemsService } from "../services/navbar-items.service";

// type driveUserScriptType = {
//   hasDriveUserScript?: boolean
//   driveUserscriptVersion?: string
// }
//type hashArgsType = [string, string, 0 | 1, string, 0 | 1, string?];
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
  private unsubCallBacks: Array<() => void>;
  constructor(private navItems: NavbarItemsService) {
    this.frameLoading = false;
    this.frameBaseSrc = './assets';
    this.frameFakeConsoleLog = false;
    this.playing = false;
    this.currentI = 0;
    this.timeOffset = 0;
    this.remainingDelay = 0;
    this.unsubCallBacks = [];
    this.speedX = 1;
    this.cancelDelay = this.noop = (): void => { };
    this.frameMessage = (msg: MessageEvent<any>) => {
      if (typeof msg?.data?.replayPostMessage === 'object') {
        this.receiveMessage(msg.data.replayPostMessage as ReplayPostMessage);
      }
    }
    this.navItems.disableAll();
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
    let selectedFileSubscription: Subscription = this.navItems.fileList.selectedChanges.subscribe((file: ReplayFile): void => { this.changeFile(file); });
    this.unsubCallBacks.push((): void => {
      selectedFileSubscription.unsubscribe();
    });
  }
  public ngOnDestroy(): void {
    if (this.playing) this.pause();
    this.unsubFromEvents();
  }
  private unsubFromEvents(): void {
    this.unsubCallBacks.forEach((s: () => void): void => s());
  }
  private async changeFile(file: ReplayFile): Promise<void> {
    if (!this.frameLoading) {
      try {
        if (this.playing) this.pause();
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
        this.frameWin = await this.loadReplayFrame(this.frameBaseSrc + '/cytube_iframe/v2_page.html?_' + Date.now() + hash);
        let playPauseSubscription: Subscription = this.navItems.playPause.clicked.subscribe((v: boolean): void => {
          if (this.playing) this.pause();
          else this.play();
        });
        this.unsubCallBacks.push((): void => {
          playPauseSubscription.unsubscribe();
        });
        this.navItems.disableAllExcept([this.navItems.playPause, this.navItems.skipTo, this.navItems.speedX, this.navItems.fileList, this.navItems.fileSelect])
        this.navItems.showAllExcept([this.navItems.skipTo]);
        this.file = file;
      }
      catch (err) {
        console.log('Change file error:', err);
      }
    }
  }
  private pause(): void {
    if (this.file != null && this.playing) {
      this.playing = false;
      this.navItems.playPause.paused = true;
      this.cancelDelay();
    }
  }
  private play(): void {
    if (this.file != null && !(this.playing)) {
      this.timeOffset = (Date.now() + this.remainingDelay) - this.file.events[this.currentI].time;
      this.playing = true;
      this.navItems.playPause.paused = false;
      this.playThread();
    }
  }
  async playThread(): Promise<void> {
    if (this.file != null) {
      for (let i: number = this.currentI; i < this.file.events.length && this.playing; i++) {
        this.currentI = i;
        let event: ReplayEvent = this.file.events[i];
        let eventTime: number = event.time + this.timeOffset;
        let eventDelay: number = eventTime - Date.now();
        if (this.speedX != 1) {
          this.timeOffset -= eventDelay - Math.floor(eventDelay / this.speedX);
          eventDelay = Math.floor(eventDelay / this.speedX);
        }
        this.remainingDelay = await this.delay(eventDelay);
        if(this.playing) {
          //TODO: send event to iframe
          console.log('ev', i, event, this.remainingDelay, eventDelay);
        }
      }
    }
  }
  private async delay(duration: number): Promise<number> {
    return await new Promise((resolve: (value: number) => void): void => {
      let end: number = Date.now() + duration;
      let tout: number = window.setTimeout((): void => {
        this.cancelDelay = this.noop;
        resolve(0);
      }, duration);
      this.cancelDelay = (): void => {
        window.clearTimeout(tout);
        this.cancelDelay = this.noop;
        resolve(end - Date.now());
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
  private get speedX():number {
    return this.navItems.speedX.value;
  }
  private set speedX(value:number) {
    this.navItems.speedX.value = value;
  }
}
