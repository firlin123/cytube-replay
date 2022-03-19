import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherComponent } from './other.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataModule } from './data/data.module';


@NgModule({
  declarations: [ OtherComponent ],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    DataModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    OtherComponent
  ]
})
export class OtherModule { }
