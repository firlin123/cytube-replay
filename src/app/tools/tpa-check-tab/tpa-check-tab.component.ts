import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-tpa-check-tab',
  templateUrl: './tpa-check-tab.component.html',
  styleUrls: ['./tpa-check-tab.component.css']
})
export class TPACheckTabComponent implements OnInit {
  @Output() public tpaCheckingChange: EventEmitter<boolean>;
  public tpaChecking: boolean;
  private _file: ReplayFile | null;

  public constructor() {
    this._file = null;
    this.tpaChecking = false;
    this.tpaCheckingChange = new EventEmitter<boolean>();
  }

  public ngOnInit(): void { }

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
    console.log("TODO tpa check");
  }
}
