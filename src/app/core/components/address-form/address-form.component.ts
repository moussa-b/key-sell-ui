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
  @Input() required = false;
  addressForm!: FormGroup;
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

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      id: [],
      street: ['', this.required ? Validators.required : null],
      zipCode: ['', this.required ? Validators.required : null],
      city: ['', this.required ? Validators.required : null],
      countryCode: ['', this.required ? Validators.required : null],
      complement: [''],
    });
    this.valueChangeSubscription = this.addressForm.valueChanges.subscribe(() => {
      this.onChange(this.addressForm.getRawValue());
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
