import { EventEmitter } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { NavbarItemsService } from "../services/navbar-items.service";
import { NavbarItem } from "./navbar-item";

export class NavbarSpeedX extends NavbarItem {
    public readonly control: FormControl;
    public readonly valueChanges: EventEmitter<number>;
    private _value: number;
    private _step: number;
    private _min: number;
    private _max: number;
    private ignoreNext: boolean;
    private dontEmitNext: boolean;

    constructor(items: NavbarItemsService) {
        super(items);
        this.valueChanges = new EventEmitter<number>();
        this._value = 1;
        this._step = 0.25;
        this._min = 0.25;
        this._max = 100;
        this.ignoreNext = false;
        this.dontEmitNext = false;
        this.control = new FormControl(this._value, Validators.compose([Validators.min(0.25), Validators.max(100)]));
        this.setupControl();
    }

    private setupControl() {
        this.control.valueChanges.subscribe((inputValue: number) => {
            if (!(this.ignoreNext)) {
                let oldValue: number = this._value;
                let newValue: number;
                try {
                    newValue = Math.floor(inputValue * 4) / 4;
                    let setI = (i: number) => {
                        this._min = i;
                        this._step = i;
                        newValue = Math.ceil(newValue / i) * i;
                        if (newValue != inputValue) {
                            this.ignoreNext = true;
                            this.control.setValue(newValue);
                            this.ignoreNext = false;
                        }
                    }
                    if (newValue > 25) setI(25);
                    else if (newValue > 5) setI(5);
                    else if (newValue > 2) setI(1);
                    else {
                        this._min = 0.25;
                        this._step = 0.25;
                    }
                    if (newValue < 0.25 || newValue > 999) {
                        newValue = 1;
                    }
                }
                catch {
                    newValue = 1;
                }
                if (oldValue != newValue) {
                    this._value = newValue;
                    if(!(this.dontEmitNext)) {
                        this.valueChanges.emit(newValue);
                    }
                }
            }
        });
    }

    public get step(): number {
        return this._step;
    }

    public get min(): number {
        return this._min;
    }

    public get max(): number {
        return this._max;
    }

    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        this.dontEmitNext = true;
        this.control.setValue(value);
        this.dontEmitNext = false;
    }
}
