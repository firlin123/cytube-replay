import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TPACheckTabComponent } from './tpa-check-tab.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [ TPACheckTabComponent ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    TPACheckTabComponent
  ]
})
export class TPACheckTabModule { }
