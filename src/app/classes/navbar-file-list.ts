import { EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ReplayFile } from "../types/replay/replay-file";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";

export class NavbarFileList extends NavbarItem {
    public readonly control: FormControl;
    public readonly selectedChanges: EventEmitter<ReplayFile>;
    private _list: Array<ReplayFile>;
    private _selected: ReplayFile | null;
    constructor(items: NavbarItemsService) {
        super(items);
        this.selectedChanges = new EventEmitter<ReplayFile>();
        this._list = [];
        this._selected = null;
        this.control = new FormControl();
        this.setupControl();
    }

    private setupControl() {
        this.control.valueChanges.subscribe((inputValue: string) => {
            let input = parseInt(inputValue);
            let selected = this._list[input];
            if (selected != null) {
                this._selected = selected;
                this.selectedChanges.emit(selected);
            }
        });
    }

    public set list(value: Array<ReplayFile>) {
        if (this._list != value && value.length > 0) {
            this._list = value;
            this.control.setValue('0');
        }
    }

    public get list(): Array<ReplayFile> {
        return this._list;
    }

    public get displayed() {
        return this.items.fileSelect.displayed && this._list.length > 1 && this.enabled && this.shown;
    }

    public get selected(): ReplayFile | null {
        return this._selected;
    }
}