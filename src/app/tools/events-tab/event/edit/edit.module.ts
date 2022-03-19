import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditComponent } from './edit.component';
import { TypeModule } from './type/type.module';
import { ChangeMediaModule } from './change-media/change-media.module';
import { OtherModule } from './other/other.module';


@NgModule({
  declarations: [ EditComponent ],
  imports: [
    CommonModule,
    TypeModule,
    ChangeMediaModule,
    OtherModule
  ],
  exports: [
    EditComponent
  ]
})
export class EditModule { }
