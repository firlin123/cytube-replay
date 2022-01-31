import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";

export class NavbarLoading extends NavbarItem {
    private _text: string;

    constructor(items: NavbarItemsService) {
        super(items);
        this._text = '';
    }

    public get text(): string {
        return 'Loading ' + this._text;
    }
    
    public set text(value: string) {
        this._text = value.trim();
    }
}
