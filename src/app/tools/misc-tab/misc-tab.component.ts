import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/classes/utils';
import { Site } from 'src/app/enums/site';
import { EvQueue } from 'src/app/types/replay-state/ev-queue';
import { Media } from 'src/app/types/replay-state/media';
import { PlaylistItem } from 'src/app/types/replay-state/playlist-item';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'misc-tab',
  templateUrl: './misc-tab.component.html',
  styleUrls: ['./misc-tab.component.css']
})
export class MiscTabComponent implements OnInit, OnDestroy {
  private _file: ReplayFile | null;
  public queuedMedia: Array<[string, string]>;
  public queuedMediaText: string;
  public includeTiles: FormControl;
  private _includeTitles: boolean;
  private includeTilesSubscription: Subscription;

  public constructor() {
    this._file = null;
    this.queuedMedia = [];
    this.queuedMediaText = '';
    this.includeTiles = new FormControl(true);
    this._includeTitles = true;
    this.includeTilesSubscription = this.includeTiles.valueChanges.subscribe((value: boolean) => {
      this.includeTilesChange(value);
    });
  }

  public ngOnInit(): void { }
  
  public ngOnDestroy(): void {
    this.unsubAll();
  }

  private unsubAll(): void {
    this.includeTilesSubscription.unsubscribe();
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
  }

  public getAllQueuedMediaClick(): void {
    const queuedMediaMap: Record<string, PlaylistItem> = {};
    for (const event of this.file.events) {
      if (event.type === 'playlist' || event.type === 'queue') {
        let items: Array<PlaylistItem> = [];
        if (event.type === 'playlist') {
          let playlist: Array<PlaylistItem> = event.data[0];
          if (playlist instanceof Array) items = playlist;
        }
        else {
          let queue: EvQueue = event.data[0];
          if (queue != null) if (queue.item != null) items = [queue.item];
        }
        for (const item of items) {
          const itemId: string = JSON.stringify({ t: item.media.type, i: item.media.id, T: item.media.title });
          if (!(itemId in queuedMediaMap)) {
            queuedMediaMap[itemId] = item;
          }
        }
      }
    }
    this.queuedMedia = [];
    const site: Site = this.file.site;
    const pgVer: string = Utils.pageVersion(site, this.file.start);
    for (const key in queuedMediaMap) {
      let media: Media = queuedMediaMap[key].media;
      this.queuedMedia.push([media.title, Utils.mediaToUrl(site, pgVer, media)]);
    }
    this.updateQueuedMediaText();
  }

  private includeTilesChange(value: boolean): void {
    if (this._includeTitles !== value) {
      this._includeTitles = value;
      this.updateQueuedMediaText();
    }
  }

  private updateQueuedMediaText(): void {
    if (this._includeTitles) {
      this.queuedMediaText = this.queuedMedia.map((e: [string, string]): string => `${e[0]}: ${e[1]}`).join(',\n');
    }
    else {
      this.queuedMediaText = this.queuedMedia.map((e: [string, string]): string => `${e[1]}`).join(',\n');
    }
  }
}
