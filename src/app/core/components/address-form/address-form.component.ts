import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';
import { Address } from '../../models/address.model';
import { Subscription } from 'rxjs';
import { LabelValue } from '../../models/label-value.model';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-address-form',
  imports: [
    ReactiveFormsModule,
    InputText,
    TranslatePipe,
    DropdownModule,
    Select
  ],
  templateUrl: './address-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressFormComponent),
      multi: true,
    },
  ],
})
export class AddressFormComponent implements ControlValueAccessor, OnInit, OnDestroy {

  addressForm: FormGroup;
  valueChangeSubscription!: Subscription;
  onChange: (value: Address) => void = () => {
  };
  onTouched: () => void = () => {
  };

  private _countries!: LabelValue<string>[];
  get countries(): LabelValue<string>[] {
    return this._countries;
  }
  @Input() set countries(value: LabelValue<string>[]) {
    this._countries = value;
    if (value?.length === 1) {
      this.addressForm.get('countryCode')!.patchValue(value[0].value, {emitEvent: false});
      this.addressForm.get('countryCode')!.disable();
    }
  }

  private _required: boolean = false;
  get required(): boolean {
    return this._required;
  }
  @Input() set required(value: boolean) {
    const controls = ['street', 'zipCode', 'city', 'countryCode'];
    if (value) {
      controls.forEach(control => this.addressForm.get(control)!.setValidators([Validators.required]));
    } else {
      controls.forEach(control => this.addressForm.get(control)!.clearValidators());
    }
    controls.forEach(control => this.addressForm.get(control)!.updateValueAndValidity());
  }

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      id: [],
      street: ['', Validators.required],
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      countryCode: ['', Validators.required],
      complement: [''],
    });
  }

  ngOnInit(): void {
    this.valueChangeSubscription = this.addressForm.valueChanges.subscribe((address: Address) => {
      this.onChange(address);
    });
  }

  ngOnDestroy(): void {
    this.valueChangeSubscription?.unsubscribe();
  }

  writeValue(address: Address): void {
    if (address) {
      this.addressForm.patchValue(address, {emitEvent: false});
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.addressForm.disable() : this.addressForm.enable();
  }
}
