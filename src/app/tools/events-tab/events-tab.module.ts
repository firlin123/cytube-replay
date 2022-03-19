import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsTabComponent } from './events-tab.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EventModule } from './event/event.module';


@NgModule({
  declarations: [ EventsTabComponent ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatPaginatorModule,
    EventModule
  ],
  exports: [
    EventsTabComponent
  ]
})
export class EventsTabModule { }
