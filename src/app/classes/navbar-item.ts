import { NavbarItemsService } from "../services/navbar-items.service";

export abstract class NavbarItem {
    protected items: NavbarItemsService;
    protected _enabled: boolean;
    protected _shown: boolean;
    
    constructor(items: NavbarItemsService) {
        this.items = items;
        this._enabled = false;
        this._shown = true;
    }

    public set enabled(value: boolean) {
        if (this._enabled != !!value) {
            this._enabled = !!value;
        }
    }

    public set shown(value: boolean) {
        if (this._shown != !!value) {
            this._shown = !!value;
        }
    }

    public get enabled(): boolean { 
        return this._enabled; 
    }
    
    public get shown(): boolean { 
        return this._shown; 
    }

    public get displayed(): boolean { 
        return this.enabled && this.shown 
    }
}
