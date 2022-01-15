import { Injectable } from '@angular/core';
import { NavbarItem } from '../interfaces/navbar-item';

@Injectable({
  providedIn: 'root'
})
export class NavbarItemsService {

  constructor() { }
  
  private _items:NavbarItem[] = [{}, {}, {}];
 
  setItems(items: NavbarItem[]):void {
      this._items.push(...items);
  }
 
  getItems(): NavbarItem[] {
      return this._items;
  }
}
