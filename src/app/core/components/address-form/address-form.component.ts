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
import { InputText } from 'primeng/inputtext';
import { Address } from '../../models/address.model';
import { Subscription } from 'rxjs';
import { LabelValue } from '../../models/label-value.model';
import { Select } from 'primeng/select';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'ks-address-form',
  imports: [
    ReactiveFormsModule,
    InputText,
    TranslatePipe,
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

  supportedCountries: LabelValue<string>[] = [];

  constructor(private fb: FormBuilder, private commonService: CommonService) {
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

    this.commonService.getSupportedCountries().subscribe((countries: LabelValue<string>[]) => {
      this.supportedCountries = countries;
      if (countries?.length === 1) {
        this.addressForm.get('countryCode')!.patchValue(countries[0].value, {emitEvent: false});
        this.addressForm.get('countryCode')!.disable();
      }
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
