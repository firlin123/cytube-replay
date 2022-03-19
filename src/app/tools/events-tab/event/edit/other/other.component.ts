import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/classes/utils';
import { DataType } from 'src/app/enums/data-types';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.css']
})
export class OtherComponent implements OnInit, OnDestroy {
  public hasData: FormControl;
  private hasDataSubscription: Subscription;
  private previousDataExisted: boolean;
  private previousData: any;
  private _data: Array<any> | null;
  private _file: ReplayFile | null;

  public constructor() {
    this._data = null;
    this._file = null;
    this.previousDataExisted = false;
    this.hasData = new FormControl();
    this.hasDataSubscription = this.hasData.valueChanges.subscribe((value: boolean) => {
      this.hasDataChange(value);
    });
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    this.unsubAll();
  }

  private unsubAll() {
    this.hasDataSubscription.unsubscribe();
  }

  private hasDataChange(value: boolean): void {
    if (value) {
      if (this.data.length === 0) {
        let data = this.previousDataExisted ? this.previousData : {};
        this.data.push(data);
        this.file.edited = true;
      }
    }
    else {
      if (this.data.length !== 0) {
        this.previousDataExisted = true;
        this.previousData = this.data.pop();
        this.file.edited = true;
      }
    }
  }

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
    this.onData();
  }

  private onData() {
    if (this.data.length !== 0) {
      this.hasData.setValue(true);
    }
    else this.hasData.setValue(false);
  }

  public dataChange(data: any): void {
    if (this.data.length !== 0) {
      this.data[0] = data;
      this.file.edited = true;
    }
  }
}