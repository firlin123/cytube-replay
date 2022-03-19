import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReplayEvent } from 'src/app/types/replay/replay-event';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  @Output() public delete: EventEmitter<true>;
  public editing: boolean;
  private _event: ReplayEvent | null;
  private _file: ReplayFile | null;

  constructor() {
    this._file = null;
    this._event = null;
    this.editing = false;
    this.delete = new EventEmitter<true>();
  }

  public ngOnInit(): void { }

  // private eventTypeChange(value: EventType) {
  //   let custom: boolean = value === EventType.Custom;
  //   if(this.customEvent !== custom) {
  //     if(custom) {
  //       let name: string= this.previousCustomTypeName ?? 'eventName';
  //       this.event.type = name;
  //       this.eventTypeName.setValue(name);
  //     }
  //     else {
  //       this.previousCustomTypeName = this.event.type;
  //     }
  //   }
  // }

  // private eventTypeNameChange(value: string) {
  //   switch (value) {
  //     case '':
  //       break;
  //     case 'changeMedia':
  //       this.eventType.setValue(EventType['Change Media']);
  //       break;
  //     default:
  //       if (value !== this.event.type) {
  //         console.log('ev.t', value);
  //         this.event.type = value;
  //       }
  //       break;
  //   }
  // }

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

  public onDelete() {
    let idx: number = this.file.events.indexOf(this.event);
    if (idx !== -1) {
      this.file.events.splice(idx, 1);
      this.file.edited = true;
      this.delete.emit(true);
    }
  }
}
