import { Injectable } from '@angular/core';
import { NavbarFileList } from '../classes/navbar-file-list';
import { NavbarFileSelect } from '../classes/navbar-file-select';
import { NavbarItem } from '../classes/navbar-item';
import { NavbarLoading } from '../classes/navbar-loading';
import { NavbarPlayPause } from '../classes/navbar-play-pause';
import { NavbarSkipTo } from '../classes/navbar-skip-to';
import { NavbarSpeedX } from '../classes/navbar-speed-x';

@Injectable({
  providedIn: 'root'
})
export class NavbarItemsService {
  public readonly fileSelect: NavbarFileSelect;
  public readonly fileList: NavbarFileList;
  public readonly skipTo: NavbarSkipTo;
  public readonly speedX: NavbarSpeedX;
  public readonly loading: NavbarLoading;
  public readonly playPause: NavbarPlayPause;
  private items: Array<NavbarItem>;

  constructor() {
    this.items = [];
    this.items.push(this.loading = new NavbarLoading(this));
    this.items.push(this.fileList = new NavbarFileList(this));
    this.items.push(this.fileSelect = new NavbarFileSelect(this));
    this.items.push(this.skipTo = new NavbarSkipTo(this));
    this.items.push(this.speedX = new NavbarSpeedX(this));
    this.items.push(this.playPause = new NavbarPlayPause(this));
  }

  private setForAllExcept(exceptions: Array<NavbarItem>, property: 'enabled' | 'shown', value: boolean) {
    this.items.forEach((item: NavbarItem) => exceptions.includes(item) ? (item[property] = !!value) : 0);
  }

  private allExcept(exceptions: Array<NavbarItem>, property: 'enabled' | 'shown', value: boolean) {
    this.items.forEach((item: NavbarItem) => item[property] = (exceptions.includes(item) ? !value : !!value));
  }

  public enable(items: Array<NavbarItem>) {
    items.forEach((item: NavbarItem) => item.enabled = true);
  }

  public disable(items: Array<NavbarItem>) {
    items.forEach((item: NavbarItem) => item.enabled = false);
  }

  public enableAll() {
    this.enableAllExcept([]);
  }

  public disableAll() {
    this.disableAllExcept([]);
  }

  public enableAllExcept(items: Array<NavbarItem>) {
    this.allExcept(items, 'enabled', true);
  }

  public disableAllExcept(items: Array<NavbarItem>) {
    this.allExcept(items, 'enabled', false);
  }

  public setEnableForAllExcept(items: Array<NavbarItem>) {
    this.setForAllExcept(items, 'enabled', true);
  }

  public setDisableForAllExcept(items: Array<NavbarItem>) {
    this.setForAllExcept(items, 'enabled', false);
  }

  public show(items: Array<NavbarItem>) {
    items.forEach((item: NavbarItem) => item.shown = true);
  }

  public hide(items: Array<NavbarItem>) {
    items.forEach((item: NavbarItem) => item.shown = false);
  }

  public showAll() {
    this.showAllExcept([]);
  }

  public hideAll() {
    this.hideAllExcept([]);
  }

  public showAllExcept(items: Array<NavbarItem>) {
    this.allExcept(items, 'shown', true);
  }

  public hideAllExcept(items: Array<NavbarItem>) {
    this.allExcept(items, 'shown', false);
  }

  public setShowForAllExcept(items: Array<NavbarItem>) {
    this.setForAllExcept(items, 'shown', true);
  }
  
  public setHideForAllExcept(items: Array<NavbarItem>) {
    this.setForAllExcept(items, 'shown', false);
  }
}
