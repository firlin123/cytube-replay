import { Component, Input, OnInit } from '@angular/core';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-change-media',
  templateUrl: './change-media.component.html',
  styleUrls: ['./change-media.component.css']
})
export class ChangeMediaComponent implements OnInit {
  private _data: Array<any> | null;
  private _file: ReplayFile | null;

  public constructor() {
    this._data = null;
    this._file = null;
  }

  public ngOnInit(): void {}

  public get ready(): boolean {
    return this._data != null && this._file !== null;
  }

  public get file(): ReplayFile {
    if (this._file != null) return this._file;
    else throw new Error('File was not ready');
  }

  @Input() public set file(value: ReplayFile) {
    this._file = value;
  }

  public get data(): Array<any> {
    if (this._data != null) return this._data;
    else throw new Error('Data was not ready');
  }

  @Input() public set data(value: Array<any>) {
    this._data = value;
  }

}
