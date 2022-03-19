import { EventEmitter, OnDestroy } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/classes/utils';
import { DataType } from 'src/app/enums/data-types';
import { ReplayFile } from 'src/app/types/replay/replay-file';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit, OnDestroy {
  @Output() public dataChange: EventEmitter<any>;
  public dataValue: FormControl;
  public dataType: FormControl;
  public newFieldName: FormControl;
  public newFieldType: FormControl;
  public dataTypes: Record<string, DataType>;
  public dataTypeKeys: Array<string>;
  public dataKeys: Array<string>;
  public dataKeysControls: Array<FormControl>;
  public dataKeysSave: Array<() => void>;
  public dataKeysDelete: Array<() => void>;
  private dataTypeSubscription: Subscription;
  private dataValueSubscription: Subscription;
  private hasData: boolean;
  private _data: any;
  private _file: ReplayFile | null;

  public constructor() {
    this.hasData = false;
    this._file = null;
    this.dataKeys = [];
    this.dataKeysControls = [];
    this.dataKeysSave = [];
    this.dataKeysDelete = [];
    this.dataChange = new EventEmitter<any>();
    this.dataType = new FormControl();
    this.dataValue = new FormControl(null, [(control: AbstractControl): ValidationErrors | null => {
      let errors: Array<string> | string | number | boolean = this.getValueOrErrors(control.value);
      return (errors instanceof Array) ? { errors } : null;
    }]);
    this.newFieldType = new FormControl(DataType.String);
    this.newFieldName = new FormControl('', [
      (control: AbstractControl): ValidationErrors | null => {
        if (this.hasData)
          if (Utils.dataToDataType(this.data) === DataType.Object)
            if (!(this.validFieldName(control.value)))
              return { errors: ['This field already exists.'] }
        return null;
      }
    ]);
    this.dataTypes = DataType;
    this.dataTypeKeys = Object.keys(DataType);
    this.dataTypeSubscription = this.dataType.valueChanges.subscribe((value: DataType): void => {
      this.dataTypeChange(value);
    });
    this.dataValueSubscription = this.dataValue.valueChanges.subscribe((value: string): void => {
      let val: Array<string> | string | number | boolean = this.getValueOrErrors(value);
      if (!(val instanceof Array)) this.dataValueChange(val);
    });
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    this.unsubAll();
  }

  private getValueOrErrors(value: string): boolean | string | number | Array<string> {
    let errors: Array<string> = [];
    let result: boolean | string | number | null = null;
    if (this._data != null) {
      switch (this.getDataType()) {
        case DataType.Number:
          try {
            let num: number = parseFloat(value);
            if (isNaN(num)) errors.push('Invalid number');
            else result = num;
          } catch (err) { errors.push(`Number parse exception: ${err}`); }
          break;
        case DataType.Boolean:
          if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
            errors.push('Invalid boolean');
          }
          else result = value.toLowerCase() === 'true';
          break;
        default:
          result = value;
          break;
      }
    }
    return result != null ? result : errors;
  }

  private dataValueChange(value: any): void {
    if (this.data != value) {
      this.data = value;
      this.dataChange.emit(value);
    }
  }

  private dataTypeChange(value: DataType): void {
    if (this.getDataType() !== value) {
      this.data = Utils.dataTypeToData(value);
      this.dataChange.emit(this.data);
    }
  }

  private unsubAll() {
    this.dataTypeSubscription.unsubscribe();
    this.dataValueSubscription.unsubscribe();
  }

  public get ready(): boolean {
    return this.hasData && this._file !== null;
  }

  public get file(): ReplayFile {
    if (this._file != null) return this._file;
    else throw new Error('File was not ready');
  }

  @Input() public set file(value: ReplayFile) {
    this._file = value;
  }

  public get data(): any {
    if (this.hasData) return this._data;
    else throw new Error('Data was not ready');
  }

  @Input() public set data(value: any) {
    if (this._data !== value) {
      this._data = value;
      this.hasData = true;
      this.onData();
    }
    else this.hasData = true;
  }

  private onData() {
    let dataType: DataType = this.getDataType();
    if (dataType !== this.dataType.value) {
      this.dataType.setValue(dataType);
    }
    if (dataType === DataType.String || dataType === DataType.Number || dataType === DataType.Boolean) {
      let valueStr: string = `${this.data}`;
      if (valueStr !== this.dataValue.value) {
        this.dataValue.setValue(valueStr);
      }
    }
    this.regenerateDataKeys(dataType !== DataType.Object);
  }

  public getDataType(): DataType {
    let dataType: DataType = Utils.dataToDataType(this.data);
    return dataType;
  }

  public dataSetKey(key: string, data: any) {
    this.data[key] = data;
    this.file.edited = true;
  }

  public validFieldName(name: string) {
    return !(name in this.data);
  }

  private regenerateDataKeys(empty: boolean): void {
    this.dataKeys = empty ? [] : Object.keys(this.data).sort();
    this.dataKeysSave = [];
    this.dataKeysDelete = [];
    this.dataKeysControls = this.dataKeys.map((name: string): FormControl => {
      let formControl: FormControl = new FormControl(name, [
        (control: AbstractControl): ValidationErrors | null =>
          (this.validFieldName(control.value) || control.value === name) ? null : {
            errors: ['This field already exists.']
          }
      ]);
      this.dataKeysDelete.push((): void => {
        delete this.data[name];
        this.file.edited = true;
        this.regenerateDataKeys(false);
      });
      this.dataKeysSave.push((): void => {
        if (this.validFieldName(formControl.value)) {
          let data: any = this.data[name];
          delete this.data[name];
          this.data[formControl.value] = data;
          this.file.edited = true;
          this.regenerateDataKeys(false);
        }
      });
      return formControl;
    });
    this.newFieldName.updateValueAndValidity();
  }

  public addNewField() {
    let name: string = this.newFieldName.value;
    let dataType: DataType = this.newFieldType.value;
    if (this.validFieldName(name)) {
      let data: any = Utils.dataTypeToData(dataType);
      this.data[name] = data;
      this.newFieldName.setValue('');
      this.newFieldType.setValue(DataType.String);
      this.regenerateDataKeys(false);
    }
  }
}
