import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarItemsService } from '../services/navbar-items.service';
import { NamedBlob } from '../types/named-blob';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit, OnDestroy {
  public constructor() { }

  public ngOnDestroy(): void { }

  public ngOnInit(): void { }
}
