import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from "./main.component";
import { RouterModule, Routes } from "@angular/router";
import { NavbarModule } from "../navbar/navbar.module";

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'editor',
        loadChildren: () => import('../editor/editor.module').then(m => m.EditorModule),
      },
      {
        path: 'index',
        loadChildren: () => import('../index/index.module').then(m => m.IndexModule),
      },
      {
        path: '**',
        redirectTo: 'index',
        pathMatch: 'full'
      },
    ]
  }
]

@NgModule({
  declarations: [ MainComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NavbarModule
  ]
})
export class MainModule { }
