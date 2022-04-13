import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarItemsService } from '../services/navbar-items.service';
import { NamedBlob } from '../types/named-blob';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.css']
})
export class LoadComponent implements OnInit, OnDestroy {
  public url: string;
  private subscription: Subscription | null;
  private unloaded: boolean;

  public constructor(private router: Router, private route: ActivatedRoute, private navbar: NavbarItemsService) {
    this.url = '';
    this.unloaded = false;
    this.subscription = this.route.queryParams.subscribe(async (params: Record<string, string>) => {
      let jsonUrl: string | undefined = params.json;
      let zipUrl: string | undefined = params.zip;
      let url: string = '';
      let zip: boolean = false;
      let fileName: string = '';
      if (typeof jsonUrl === 'string') {
        fileName = this.urlGetFileName(jsonUrl, '.json');
        if (fileName !== '') url = jsonUrl;
      }
      if (typeof zipUrl === 'string' && fileName === '') {
        fileName = this.urlGetFileName(zipUrl, '.zip');
        if (fileName !== '') {
          url = zipUrl;
          zip = true;
        }
      }
      if (url !== '' && fileName !== '') {
        this.url = url;
        this.navbar.loadingConfig(fileName);
        try {
          let urlObj: URL = new URL('https://cors-bypass.firlin123.workers.dev/');
          urlObj.searchParams.append('url', url);
          let response: Response = await fetch(urlObj.toString());
          if (response.ok) {
            let contentType: string = response.headers.get('content-type') ?? '';
            if ((contentType.startsWith('application/json') && !zip) || (contentType.startsWith('application/zip') && zip)) {
              let blob: NamedBlob = await response.blob() as NamedBlob;
              blob.name = fileName;
              navbar.fileSelect.filesChange([blob]);
            }
          }
        }
        catch (e) { }
      }
      if (this.subscription != null) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      if (!(this.unloaded)) {
        this.router.navigate(['/']);
      }
    });
  }

  private urlGetFileName(url: string, ext: string): string {
    try {
      let urlObj: URL = new URL(url);
      if ((urlObj.protocol === 'http:' || urlObj.protocol === 'https:')) {
        let path: string = urlObj.pathname;
        let pathParts: Array<string> = path.split('/');
        let fileName: string = pathParts[pathParts.length - 1];
        if (fileName === '') {
          fileName = 'file-from-url' + ext;
        }
        if (!(fileName.endsWith(ext))) {
          fileName += ext;
        }
        return fileName;
      }
    }
    catch (e) { }
    return '';
  }

  public ngOnDestroy(): void {
    this.unloaded = true;
    if (this.subscription != null) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  public ngOnInit(): void { }
}
