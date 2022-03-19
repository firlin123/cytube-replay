import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/classes/utils';
import { Site } from 'src/app/enums/site';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-file-tab',
  templateUrl: './file-tab.component.html',
  styleUrls: ['./file-tab.component.css']
})
export class FileTabComponent implements OnInit, OnDestroy {
  public U: typeof Utils;
  public filePath: FormControl;
  public site: FormControl;
  public channelName: FormControl;
  public name: FormControl;
  public sites: Record<string, Site>;
  public siteKeys: Array<string>;
  private filePathSubscription: Subscription;
  private siteSubscription: Subscription;
  private channelNameSubscription: Subscription;
  private nameSubscription: Subscription;
  private _file: ReplayFile | null;

  public constructor() {
    this.U = Utils;
    this.filePath = new FormControl();
    this.site = new FormControl();
    this.channelName = new FormControl('replay', [(control: AbstractControl): ValidationErrors | null => {
      return this.getChannelNameValidationErrors(control.value);
    }]);
    this.name = new FormControl();
    this.filePathSubscription = this.filePath.valueChanges.subscribe((value: string): void => {
      this.filePathChange(value);
    });
    this.siteSubscription = this.site.valueChanges.subscribe((value: Site): void => {
      this.siteChange(value);
    });
    this.channelNameSubscription = this.channelName.valueChanges.subscribe((value: string): void => {
      if (this.getChannelNameValidationErrors(value) == null) this.channelNameChange(value);
    });
    this.nameSubscription = this.name.valueChanges.subscribe((value: string): void => {
      this.nameChange(value);
    });
    this.sites = Site;
    this.siteKeys = Object.keys(Site);
    this._file = null;
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    this.unsubAll();
  }

  private unsubAll() {
    this.filePathSubscription.unsubscribe();
    this.siteSubscription.unsubscribe();
    this.channelNameSubscription.unsubscribe();
    this.nameSubscription.unsubscribe();
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

  public getVersionString(): string {
    let result = '';
    if (this.file != null) {
      result += this.file.fileVersion;
      if (typeof this.file.upgradedFrom === 'string') {
        result += ' (upgraded from ' + this.file.upgradedFrom + ')';
      }
    }
    return result;
  }

  private onFile() {
    this.filePath.setValue(this.file.filePath);
    this.site.setValue(this.file.site);
    this.channelName.setValue(this.file.channelName);
    this.name.setValue(this.file.name);
  }

  private getChannelNameValidationErrors(value: string): ValidationErrors | null {
    let errors: Array<string> = [];
    if (value === '') errors.push('Cannnel name cannot be empty');
    else if (!(/^[\w-]+$/.test(value))) {
      errors.push('Channel name may only consist of a-z, A-Z, 0-9, - and _');
    }
    return errors.length === 0 ? null : { errors };
  }

  public filePathChange(value: string): void {
    if (this.file.filePath !== value) {
      this.file.filePath = value;
      this.file.edited = true;
    }
  }

  public siteChange(value: Site): void {
    if (this.file.site !== value) {
      this.file.site = value;
      this.file.edited = true;
    }
  }

  public channelNameChange(value: string): void {
    if (this.file.channelName !== value) {
      this.file.channelName = value;
      this.file.edited = true;
    }
  }

  public nameChange(value: string): void {
    if (this.file.name !== value) {
      this.file.name = value;
      this.file.edited = true;
    }
  }
}
