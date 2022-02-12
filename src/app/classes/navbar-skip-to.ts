import { EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { NavbarSkipToItem } from "../types/navbar-skip-to-item";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";
import { ReplayFile } from "../types/replay/replay-file";
import { ReplayEvent } from "../types/replay/replay-event";
import { NavbarSkipToChangeMediaEvent } from "../types/navbar-skip-to-change-media-event";

export class NavbarSkipTo extends NavbarItem {
    public readonly noItemTitle: string;
    public readonly noItemIndex: number;
    public readonly customTimeItemTitle: string;
    public readonly customTimeItemIndex: number;
    public readonly selectedChanges: EventEmitter<number>;
    public readonly control: FormControl;
    public readonly timeControl: FormControl;
    private _value: string;
    private _timeValue: string;
    private _file?: ReplayFile;
    private _currentI?: number;
    private changeMediaEvents?: Array<NavbarSkipToChangeMediaEvent>;
    private _timeInput: boolean;

    constructor(items: NavbarItemsService) {
        super(items);
        this._timeInput = false;
        this.customTimeItemTitle = 'Custom time';
        this.customTimeItemIndex = -2;
        this.noItemTitle = 'Skip To';
        this.noItemIndex = -1;
        this.selectedChanges = new EventEmitter<number>();
        this._value = this.noItemIndex.toString();
        this._timeValue = '00:00:00';
        this.control = new FormControl(this._value);
        this.timeControl = new FormControl(this._timeValue);
        this.setupControls();
    }

    private setupControls() {
        this.control.valueChanges.subscribe((inputStr: string) => {
            let inputInt = parseInt(inputStr);
            if (!isNaN(inputInt) && this.file != null && this.changeMediaEvents instanceof Array) {
                if (inputInt === this.noItemIndex) {
                    return;
                }
                else if (inputInt === this.customTimeItemIndex) {
                    this._timeInput = true;
                    return;
                }
                else if (this.changeMediaEvents.some(e => e.index === inputInt)) {
                    let eve = this._file?.events[inputInt].time;
                    console.log("input idx", eve);
                    return;
                }
            }
            console.error("SkipTo: error");
        });
        this.timeControl.valueChanges.subscribe((inputStr: string): void => {
            let inputTime: number = new Date("1.1.2001 " + inputStr).getTime() - new Date("1.1.2001").getTime();
            console.log(inputTime, typeof inputTime);
        });
    }

    private filterChangeMediaEvents() {
        if (this._currentI != null && this.changeMediaEvents instanceof Array) {
            while ((this.changeMediaEvents.length > 0) ? (this.changeMediaEvents[0].index <= this._currentI) : false) {
                this.changeMediaEvents.shift();
            }
        }
    }

    private generateChangeMediaEvents() {
        if (this._file != null) {
            this.changeMediaEvents = this._file.events.reduce(
                (filtered: Array<NavbarSkipToChangeMediaEvent>, event: ReplayEvent, index: number) => {
                    if (event.type === 'changeMedia') {
                        if (typeof event.data?.[0]?.title === 'string') {
                            filtered.push({ title: event.data[0].title, index });
                        }
                    }
                    return filtered;
                }, []
            );
        }
        else this.changeMediaEvents = undefined;
    }

    public set file(value: ReplayFile | undefined) {
        this._file = value;
        this.generateChangeMediaEvents();
        this.filterChangeMediaEvents();
    }

    public get file(): ReplayFile | undefined {
        return this._file;
    }

    public set currentI(value: number | undefined) {
        this._currentI = value;
        this.filterChangeMediaEvents();
    }

    public get currentI(): number | undefined {
        return this._currentI;
    }

    public get list(): Array<any> {
        let result: Array<any> = [];
        if (this.changeMediaEvents instanceof Array) result = this.changeMediaEvents;
        return result;
    }

    public get timeInput(): boolean {
        return this._timeInput;
    }
}
