import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { ReplayEvent } from 'src/app/types/replay/replay-event';
import { ReplayFile } from 'src/app/types/replay/replay-file';

enum FilterEventsVariants {
  ChangeMedia = 'media',
  All = 'all',
  CustomFilter = 'custom'
};

@Component({
  selector: 'app-events-tab',
  templateUrl: './events-tab.component.html',
  styleUrls: ['./events-tab.component.css']
})
export class EventsTabComponent implements OnInit, OnDestroy {
  public static readonly pageSizeOptions: Array<number> = [10, 25, 50, 100];
  public static pageEvent: PageEvent = { pageIndex: 0, pageSize: EventsTabComponent.pageSizeOptions[1], previousPageIndex: 0, length: 0 };
  public ETC: typeof EventsTabComponent;
  public filterEvents: FormControl;
  public eventsFiltered: Array<ReplayEvent>;
  private _file: ReplayFile | null;
  private filterEventsSubscription: Subscription;

  public constructor() {
    this.ETC = EventsTabComponent;
    this.filterEvents = new FormControl();
    this.eventsFiltered = [];
    this.filterEventsSubscription = this.filterEvents.valueChanges.subscribe(
      (filterEvents: FilterEventsVariants): void => { this.filterEventsChange(filterEvents); }
    );
    this._file = null;
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    this.unsubAll();
  }

  private unsubAll() {
    this.filterEventsSubscription.unsubscribe();
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

  private filterEventsChange(showEvents: FilterEventsVariants) {
    // if (this.ready) {
      this.ETC.pageEvent.pageIndex = 0;
      switch (showEvents) {
        case FilterEventsVariants.ChangeMedia:
          this.eventsFiltered = this.file.events.filter((e: ReplayEvent): boolean => e.type === 'changeMedia');
          break;
        case FilterEventsVariants.All:
          this.eventsFiltered = this.file.events;
          break;
        case FilterEventsVariants.CustomFilter:
          this.eventsFiltered = this.file.events; //TODO
          break;
      }
    // }
  }

  public getShownEvents(): Array<ReplayEvent> {
    let pageEvent: PageEvent = this.ETC.pageEvent;
    let fromI: number = pageEvent.pageIndex * pageEvent.pageSize;
    let toI: number = fromI + pageEvent.pageSize;
    return this.eventsFiltered.filter((e: ReplayEvent, i: number) => i >= fromI && i < toI);
  }

  public onEventDelete(): void {
    let pageEvent: PageEvent = this.ETC.pageEvent;
    let previousPageIndex: number = pageEvent.pageIndex;
    this.filterEventsChange(this.filterEvents.value);
    if (this.eventsFiltered.length === previousPageIndex * pageEvent.pageSize) previousPageIndex--;
    this.ETC.pageEvent.pageIndex = previousPageIndex;
  }

  private onFile() {
    this.filterEvents.setValue(FilterEventsVariants.ChangeMedia);
  }
}
