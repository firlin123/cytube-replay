import { EventEmitter } from "@angular/core";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";

export class NavbarPlayPause extends NavbarItem {
    public readonly clicked: EventEmitter<boolean>;
    private _paused: boolean;
    
    constructor(items: NavbarItemsService) {
        super(items);
        this.clicked = new EventEmitter<boolean>();
        this._paused = true;
    }
    public click() {
        this.clicked.emit(!this.paused);
    }
    public set paused(value: boolean) {
        if (this._paused !== !!value) {
            this._paused = !!value;
        }
    }
    public get paused():boolean {
        return this._paused;
    }
}
