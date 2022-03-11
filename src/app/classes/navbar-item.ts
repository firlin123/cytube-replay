import { NavbarItemsService } from "../services/navbar-items.service";

export abstract class NavbarItem {
    protected items: NavbarItemsService;
    protected _shown: boolean;

    constructor(items: NavbarItemsService) {
        this.items = items;
        this._shown = true;
    }

    public set shown(value: boolean) {
        if (this._shown != !!value) {
            this._shown = !!value;
            if (!(this.shown)) this.onHidden();
        }
    }

    public get shown(): boolean {
        return this._shown;
    }

    public isShown(): boolean {
        return this._shown;
    }

    protected onHidden(): void { }
}
