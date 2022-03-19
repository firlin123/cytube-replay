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
        path: 'archive',
        loadChildren: () => import('../archive/archive.module').then(m => m.ArchiveModule),
      },
      {
        path: 'tools',
        loadChildren: () => import('../tools/tools.module').then(m => m.ToolsModule),
      },
      {
        path: 'load',
        loadChildren: () => import('../load/load.module').then(m => m.LoadModule),
      },
      {
        path: '',
        loadChildren: () => import('../index/index.module').then(m => m.IndexModule),
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
      },
    ]
  }
]

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NavbarModule
  ]
})
export class MainModule { }
