import { Injectable } from '@angular/core';
import { NavbarFileList } from '../classes/navbar-file-list';
import { NavbarFileSelect } from '../classes/navbar-file-select';
import { NavbarItem } from '../classes/navbar-item';
import { NavbarLoading } from '../classes/navbar-loading';
import { NavbarPlayPause } from '../classes/navbar-play-pause';
import { NavbarSkipTo } from '../classes/navbar-skip-to';
import { NavbarSpeedX } from '../classes/navbar-speed-x';
import { ItemsConfig } from '../types/navbar/items-config';

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

  private setForAllExcept(exceptions: Array<NavbarItem>, value: boolean): ItemsConfig {
    let prevConfig: ItemsConfig = this.getCurrentConfig();
    this.items.forEach((item: NavbarItem) => exceptions.includes(item) ? (item.shown = value) : 0);
    return prevConfig;
  }

  private allExcept(exceptions: Array<NavbarItem>, value: boolean): ItemsConfig {
    let prevConfig: ItemsConfig = this.getCurrentConfig();
    this.items.forEach((item: NavbarItem) => item.shown = (exceptions.includes(item) ? !value : value));
    return prevConfig;
  }

  public getCurrentConfig(): ItemsConfig {
    return {
      fileSelectShown: this.fileSelect.shown,
      fileListShown: this.fileList.shown,
      skipToShown: this.skipTo.shown,
      speedXShown: this.speedX.shown,
      loadingShown: this.loading.shown,
      playPauseShown: this.playPause.shown
    };
  }

  public setConfig(config: ItemsConfig): ItemsConfig {
    let prevConfig: ItemsConfig = this.getCurrentConfig();
    this.fileSelect.shown = config.fileSelectShown;
    this.fileList.shown = config.fileListShown;
    this.skipTo.shown = config.skipToShown;
    this.speedX.shown = config.speedXShown;
    this.loading.shown = config.loadingShown;
    this.playPause.shown = config.playPauseShown;
    return prevConfig;
  }

  public show(items: Array<NavbarItem>): ItemsConfig {
    let prevConfig: ItemsConfig = this.getCurrentConfig();
    items.forEach((item: NavbarItem) => item.shown = true);
    return prevConfig;
  }

  public hide(items: Array<NavbarItem>) {
    let prevConfig: ItemsConfig = this.getCurrentConfig();
    items.forEach((item: NavbarItem) => item.shown = false);
    return prevConfig;
  }

  public showAll(): ItemsConfig {
    return this.showAllExcept([]);
  }

  public hideAll(): ItemsConfig {
    return this.hideAllExcept([]);
  }

  public showAllExcept(items: Array<NavbarItem>): ItemsConfig {
    return this.allExcept(items, true);
  }

  public hideAllExcept(items: Array<NavbarItem>): ItemsConfig {
    return this.allExcept(items, false);
  }

  public setShowForAllExcept(items: Array<NavbarItem>): ItemsConfig {
    return this.setForAllExcept(items, true);
  }

  public setHideForAllExcept(items: Array<NavbarItem>): ItemsConfig {
    return this.setForAllExcept(items, false);
  }

  public onlyFileSelectConfig(): ItemsConfig {
    return this.hideAllExcept([this.fileList, this.fileSelect]);
  }

  public loadingConfig(text: string): ItemsConfig {
    this.loading.text = text;
    return this.hideAllExcept([this.loading]);
  }

  public readyToPlayConfig(): ItemsConfig {
    return this.hideAllExcept([this.playPause, this.skipTo, this.speedX, this.fileList, this.fileSelect]);
  }
}
