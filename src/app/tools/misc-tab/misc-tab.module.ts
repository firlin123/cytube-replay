import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiscTabComponent } from './misc-tab.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [ MiscTabComponent ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MiscTabComponent
  ]
})
export class MiscTabModule { }
