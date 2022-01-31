import { Component, OnInit } from '@angular/core';
import { NavbarItemsService } from "../services/navbar-items.service";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Utils } from '../classes/utils';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public readonly Utils: typeof Utils = Utils;
  speedXControl: FormControl = new FormControl(1, Validators.compose([Validators.min(0.25), Validators.max(100)]));
  speedX: number = 1;
  speedXStep: number = 0.25;
  speedXMin: number = 0.25;
  ignoreSpeedX: boolean = false;
  iconPaused: boolean = false;
  buttonPlayPauseHidden: boolean = false;
  public readonly items: NavbarItemsService;
  

  constructor(private navbarItemsService: NavbarItemsService) {
    this.items = navbarItemsService;
    
    this.speedXControl.valueChanges.subscribe((speedXValue: number) => {
      if (!(this.ignoreSpeedX)) {
        let prevSpeedX: number = this.speedX;
        try {
          this.speedX = Math.floor(speedXValue * 4) / 4;
          let setI = (i: number) => {
            this.speedXMin = i;
            this.speedXStep = i;
            this.speedX = Math.ceil(this.speedX / i) * i;
            if (this.speedX != speedXValue) {
              this.ignoreSpeedX = true;
              this.speedXControl.setValue(this.speedX);
              this.ignoreSpeedX = false;
            }
          }
          if (this.speedX > 25) setI(25);
          else if (this.speedX > 5) setI(5);
          else if (this.speedX > 2) setI(1);
          else {
            this.speedXMin = 0.25;
            this.speedXStep = 0.25;
          }
          if (this.speedX < 0.25 || this.speedX > 999) {
            this.speedX = 1;
          }
        }
        catch {
          this.speedX = 1;
        }
        if (prevSpeedX != this.speedX) {
          // if (playing) {
          //     pauseEvents();
          //     eventsTimeDiff += (Date.now() - pausedAt);
          //     pausedAt = null;
          //     playEvents();
          // }
          // sendMessage('replay_speed', speedX);
          console.log('speedx change', prevSpeedX, '->', this.speedX)
        }
      }
    });
  }

  ngOnInit(): void {
  }

  getItems() {
    return [{kek: 1}];
  }
}
