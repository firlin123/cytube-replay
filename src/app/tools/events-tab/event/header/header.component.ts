import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utils } from 'src/app/classes/utils';
import { ReplayEvent } from 'src/app/types/replay/replay-event';
import { ReplayFile } from 'src/app/types/replay/replay-file';

type Summary = {
  title: string;
  link: string | null;
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() public editingChange: EventEmitter<boolean>;
  @Output() public delete: EventEmitter<true>;
  public U: typeof Utils;
  private _editing: boolean;
  private _event: ReplayEvent | null;
  private _file: ReplayFile | null;

  public constructor() {
    this._editing = false;
    this._event = null;
    this._file = null;
    this.U = Utils;
    this.editingChange = new EventEmitter<boolean>();
    this.delete = new EventEmitter<true>();
  }

  public ngOnInit(): void { }

  public get editing(): boolean {
    return this._editing;
  }

  public set editing(value: boolean) {
    if (this._editing !== value) {
      this._editing = value;
      this.editingChange.emit(value);
    }
  }

  public get ready(): boolean {
    return this._event != null && this._file != null;
  }

  public get event(): ReplayEvent {
    if (this._event != null) return this._event;
    else throw new Error('Event not ready');
  }

  @Input() public set event(value: ReplayEvent) {
    this._event = value;
  }

  public get file(): ReplayFile {
    if (this._file != null) return this._file;
    else throw new Error('File not ready');
  }

  @Input() public set file(value: ReplayFile) {
    this._file = value;
  }

  public get summary(): Summary | null {
    switch (this.event.type) {
      case "changeMedia":
        let link: string = Utils.mediaToUrl(this.file.site, Utils.pageVersion(this.file.site, this.file.start), this.event.data[0]);
        return {
          title: this.event.data[0].title,
          link
        };
        break;
    }
    return null;
  }
}
