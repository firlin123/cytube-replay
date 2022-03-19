import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index.component';
import { RouterModule, Routes } from "@angular/router";
import { MyFrameModule } from './my-frame/my-frame.module';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
  }
]

@NgModule({
  declarations: [
    IndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MyFrameModule
  ]
})
export class IndexModule { }
