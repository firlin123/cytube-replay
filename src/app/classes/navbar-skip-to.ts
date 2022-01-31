import { EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { NavbarSkipToItem } from "../interfaces/navbar-skip-to-item";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";

export class NavbarSkipTo extends NavbarItem {
    public readonly noItemName: string;
    public readonly noItemValue: string;
    public readonly selectedChanges: EventEmitter<NavbarSkipToItem>;
    public readonly control: FormControl;
    private _value: string;
    private _list: Array<NavbarSkipToItem>;
    
    constructor(items: NavbarItemsService) {
        super(items);
        this.noItemName = 'Skip To';
        this.noItemValue = '-1';
        this.selectedChanges = new EventEmitter<NavbarSkipToItem>();
        this._value = this.noItemValue;
        this._list = [];
        this.control = new FormControl(this._value);
        this.setupControl();
    }

    private setupControl() {
        this.control.valueChanges.subscribe((inputValue: string) => {
            console.log(inputValue, typeof inputValue);
        });
    }

    public set list(value: Array<any>) {
        if (this._list != value) {
            this._list = value;
        }
    }
    
    public get list(): Array<any> {
        return this._list;
    }
}
