import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools.component';
import { RouterModule, Routes } from "@angular/router";
import { MatTabsModule } from '@angular/material/tabs';
import { EventsTabModule } from './events-tab/events-tab.module';
import { FileTabModule } from './file-tab/file-tab.module';
import { TPACheckTabModule } from './tpa-check-tab/tpa-check-tab.module';

const routes: Routes = [
  {
    path: '',
    component: ToolsComponent,
  }
]

@NgModule({
  declarations: [ ToolsComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    EventsTabModule,
    FileTabModule,
    TPACheckTabModule
  ]
})
export class ToolsModule { }
