import { Component, OnInit } from '@angular/core';
import { NavbarItemsService } from "../services/navbar-items.service";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(private _navbarItemsService: NavbarItemsService) { }

  ngOnInit(): void {
  }

  getItems() {
    return this._navbarItemsService.getItems();
  }

}
