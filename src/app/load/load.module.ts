import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadComponent } from './load.component';
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: LoadComponent,
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LoadModule { }
