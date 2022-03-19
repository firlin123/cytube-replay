import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavbarItemsService } from '../services/navbar-items.service';
import { ReplayFile } from '../types/replay/replay-file';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})

export class ToolsComponent implements OnInit, OnDestroy {
  public file: ReplayFile | null;
  public tpaChecking: boolean;
  private selectedFileSubscription: Subscription;

  public constructor(private navItems: NavbarItemsService) {
    this.file = null;
    this.tpaChecking = false;
    this.navItems.onlyFileSelectConfig();
    this.selectedFileSubscription = this.navItems.fileList.selectedChanges.subscribe(
      (file: ReplayFile): void => { this.fileChange(file); }
    );
    if (this.navItems.fileList.selected != null) {
      this.fileChange(this.navItems.fileList.selected);
    }
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    this.unsubFromAll();
  }

  private unsubFromAll(): void {
    this.selectedFileSubscription.unsubscribe();
  }

  private fileChange(file: ReplayFile) {
    this.file = file;
  }
}
