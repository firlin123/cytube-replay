import { Component, Input, OnInit } from '@angular/core';
import { ReplayEvent } from 'src/app/types/replay/replay-event';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  private _event: ReplayEvent | null;
  private _file: ReplayFile | null;

  constructor() {
    this._event = null;
    this._file = null;
  }

  ngOnInit(): void { }
  
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
}
