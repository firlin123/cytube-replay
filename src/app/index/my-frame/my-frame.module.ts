import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyFrameComponent } from "./my-frame.component";


@NgModule({
  declarations: [ MyFrameComponent ],
  imports: [
    CommonModule
  ],
  exports: [
    MyFrameComponent
  ]
})
export class MyFrameModule { }
