import { Component, OnInit } from '@angular/core';
import { NavbarItemsService } from "../services/navbar-items.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private _navbarItemsService: NavbarItemsService, private _router: Router) { }

  ngOnInit(): void {
  }

  gd = (globalThis as any);

  panelOpenState = false;

  getItems() {
    return this._navbarItemsService.getItems();
  }

  navigateTo(path: string) {
    this._router.navigate([path]);
  }

}
