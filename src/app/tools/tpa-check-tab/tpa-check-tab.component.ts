import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Utils } from 'src/app/classes/utils';
import { MediaState } from 'src/app/types/replay-state/media-state';
import { ReplayEvent } from 'src/app/types/replay/replay-event';
import { ReplayFile } from 'src/app/types/replay/replay-file';

type CheckMediaState = {
  name: string;
  url: string;
  id: string;
  type: string;
  checked: boolean;
  checking: boolean;
  open: boolean;
  error: string;
  tpaLinks: Array<{ name: string, url: string }>
};

@Component({
  selector: 'app-tpa-check-tab',
  templateUrl: './tpa-check-tab.component.html',
  styleUrls: ['./tpa-check-tab.component.css']
})
export class TPACheckTabComponent implements OnInit, OnDestroy {
  @Output() public tpaCheckingChange: EventEmitter<boolean>;
  public tpaChecking: boolean;
  public changeMediaList: Array<CheckMediaState>;
  private stopChecking: () => void;
  private stopAllChecking: (() => void) | null;
  private _file: ReplayFile | null;

  public constructor() {
    this._file = null;
    this.stopChecking = () => void (0);
    this.stopAllChecking = null;
    this.tpaChecking = false;
    this.changeMediaList = [];
    this.tpaCheckingChange = new EventEmitter<boolean>();
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    this.stopAnyChecking();
  }

  public get ready(): boolean {
    return this._file != null;
  }

  public get file(): ReplayFile {
    if (this._file != null) return this._file;
    else throw new Error('File was not ready');
  }

  @Input() public set file(value: ReplayFile) {
    this._file = value;
    this.onFile();
  }

  private onFile() {
    this.stopAnyChecking();
    let changeMediaList: Array<CheckMediaState> = [];
    this.file.events.filter((e: ReplayEvent) => e.type === 'changeMedia').forEach(((e: ReplayEvent) => {
      let changeMediaData: MediaState = e.data[0];
      if (!(changeMediaList.some((m: CheckMediaState) => changeMediaData.type == m.type && changeMediaData.id === m.id))) {
        let url = Utils.mediaToUrl(this.file.site, Utils.pageVersion(this.file.site, this.file.start), changeMediaData);
        changeMediaList.push({
          name: changeMediaData.title,
          url,
          id: changeMediaData.id,
          type: changeMediaData.type,
          checked: false,
          checking: false,
          open: false,
          error: '',
          tpaLinks: []
        });
      }
      this.changeMediaList = changeMediaList;
    }));
  }

  public async checkAllClick() {
    if (this.tpaChecking) {
      this.stopAnyChecking();
    }
    else {
      this.tpaChecking = true;
      this.tpaCheckingChange.emit(true);
      await this.checkAll();
      this.tpaChecking = false;
      this.tpaCheckingChange.emit(false);
    }
  }

  public async checkItemClick(item: CheckMediaState) {
    if (item.checking) {
      this.stopAnyChecking();
    }
    else {
      this.tpaChecking = true;
      this.tpaCheckingChange.emit(true);
      await this.checkItem(item);
      if (item.checked && item.error === '') item.open = true;
      this.tpaChecking = false;
      this.tpaCheckingChange.emit(false);
    }
  }

  private async checkAll() {
    await new Promise<void>(async (resolve: () => void) => {
      let checking = true;
      this.stopAllChecking = () => { checking = false; this.stopChecking(); this.stopAllChecking = () => void (0); resolve(); }
      for (const item of this.changeMediaList.filter((e: CheckMediaState) => e.type === 'yt' && !(e.checked))) {
        if (checking) await this.checkItem(item);
        else break;
      }
      if (checking && this.stopAllChecking != null) this.stopAllChecking();
    });
  }

  private async checkItem(item: CheckMediaState) {
    await new Promise<void>(async (resolve: () => void): Promise<void> => {
      this.stopChecking = () => { item.checking = false; this.stopChecking = () => void (0); resolve(); }
      item.checking = true;
      item.error = '';
      let u: URL = new URL('https://tpa.mares.workers.dev/');
      u.searchParams.set('id', item.id);
      u.searchParams.set('_', Date.now().toString());
      try {
        let tries = 0;
        let response;
        while (true) {
          tries++;
          try {
            response = await fetch(u.toString());
            break;
          }
          catch (e) {
            if (tries > 3) { throw e }
            else await new Promise<void>((r: () => void): number => window.setTimeout(r, 10000 * tries));
            if (!(item.checking)) break;
          }
        }
        if (item.checking && response != null) {
          const result = await response.json();
          if (item.checking) {
            if ('error' in result) {
              item.checked = true;
              item.error = result.error;
              this.stopChecking();
            }
            else {
              item.checked = true;
              item.tpaLinks = result.map((r: any): { name: string, url: string } => {
                return {
                  name: r.fileName,
                  url: 'https://new.theponyarchive.com' + r.filePath + encodeURIComponent(r.fileName)
                };
              });
              this.stopChecking();
            }
          }
        }
      } catch (e) {
        debugger;
        console.error('Exception:', e);
        item.error = 'Unknown error occured';
        if (item.checking) {
          this.stopChecking();
        }
      }
    });
  }

  private stopAnyChecking() {
    if (this.stopAllChecking != null) {
      this.stopAllChecking();
    } else this.stopChecking();
  }
}
