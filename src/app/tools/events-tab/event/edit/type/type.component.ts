import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReplayEvent } from 'src/app/types/replay/replay-event';
import { ReplayFile } from 'src/app/types/replay/replay-file';

enum Type {
  ChangeMedia = 'changeMedia',
  Custom = 'custom',
};

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.css']
})
export class TypeComponent implements OnInit, OnDestroy {
  public type: FormControl;
  public typeName: FormControl;
  private typeSubscription: Subscription;
  private typeNameSubscription: Subscription;
  private prevCustomName: string | null;
  private _event: ReplayEvent | null;
  private _file: ReplayFile | null;

  public constructor() {
    this._event = null;
    this._file = null;
    this.prevCustomName = null;
    this.type = new FormControl();
    this.typeName = new FormControl('eventName', [(control: AbstractControl): ValidationErrors | null => {
      return control.value === '' ? { errors: ['Event name empty'] } : null;
    }]);
    this.typeSubscription = this.type.valueChanges.subscribe((value: Type) => {
      this.typeChange(value);
    });
    this.typeNameSubscription = this.typeName.valueChanges.subscribe((value: string) => {
      if(value !== '') this.typeNameChange(value);
    });
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.unsubAll();
  }

  private unsubAll(): void {
    this.typeSubscription.unsubscribe();
    this.typeNameSubscription.unsubscribe();
  }

  public get ready(): boolean {
    return this._event != null && this._file != null;
  }

  public getType(): Type {
    return eventTypeToType(this.event.type);
  }

  public get event(): ReplayEvent {
    if (this._event != null) return this._event;
    else throw new Error('Event not ready');
  }

  @Input() public set event(value: ReplayEvent) {
    this._event = value;
    this.onEvent();
  }

  public get file(): ReplayFile {
    if (this._file != null) return this._file;
    else throw new Error('File not ready');
  }

  @Input() public set file(value: ReplayFile) {
    this._file = value;
  }

  private typeChange(value: Type): void {
    if (this.getType() !== value) {
      if (value === Type.Custom) {
        let name: string = this.prevCustomName ?? 'eventName';
        this.event.type = name;
        this.file.edited = true;
        this.typeName.setValue(name);
      }
      else {
        //TODO: check if data exist and in the correct format. Otherwise create empty data in correct format
        this.prevCustomName = this.event.type;
        this.event.type = typeToEventType(value);
        this.file.edited = true;
        this.typeName.setValue(this.event.type);
      }
    }
  }

  private typeNameChange(value: string): void {
    if (this.event.type !== value) {
      this.event.type = value;
      this.file.edited = true;
      let type: Type = this.getType();
      if (type !== Type.Custom) {
        //TODO: check if data exist and in the correct format. Otherwise create empty data in correct format 
        this.type.setValue(type);
      }
    }
  }

  private onEvent() {
    let type: Type = this.getType();
    this.typeName.setValue(this.event.type);
    this.type.setValue(type);
  }
}

function eventTypeToType(type: string): Type {
  let result: Type = Type.Custom;
  switch (type) {
    case 'changeMedia':
      result = Type.ChangeMedia;
      break;
  }
  return result;
}

function typeToEventType(type: Type): string {
  let result: string = 'eventName';
  switch (type) {
    case Type.ChangeMedia:
      result = 'changeMedia';
      break;
  }
  return result;
}
