import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { LabelValue } from '../../core/models/label-value.model';
import { CommonService } from '../../core/services/common.service';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { RealEstateService } from '../real-estate.service';
import { RealEstate } from '../model/real-estate';
import { ToasterService } from '../../core/services/toaster.service';
import { RealEstateType } from '../model/real-estate-type.enum';
import { Address } from '../../core/models/address.model';
import { AddressFormComponent } from '../../core/components/address-form/address-form.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-real-estate-form',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    Select,
    SelectButton,
    InputText,
    Button,
    Textarea,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    InputNumber,
    MultiSelect,
    AddressFormComponent
  ],
  templateUrl: './real-estate-form.component.html',
  styleUrl: './real-estate-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RealEstateFormComponent implements OnInit {
  realEstateForm!: FormGroup;
  realEstateTypes!: LabelValue<RealEstateType>[];
  booleanOptions!: LabelValue<boolean>[];
  supportedCurrencies: LabelValue<string>[] = [];
  owners: LabelValue<number>[] = [];

  constructor(private fb: FormBuilder,
              private commonService: CommonService,
              private realEstateService: RealEstateService,
              private toasterService: ToasterService,
              private translateService: TranslateService,
              private dialogConfig: DynamicDialogConfig
  ) {
  }

  ngOnInit() {
    const realEstate: RealEstate | undefined = this.dialogConfig.data?.realEstate;
    this.realEstateTypes = this.realEstateService.getRealEstatesTypes();
    this.booleanOptions = [
      {label: this.translateService.instant('common.yes'), value: true},
      {label: this.translateService.instant('common.no'), value: false}
    ];
    this.realEstateForm = this.fb.group({
      id: [realEstate?.id],
      type: [realEstate?.type, Validators.required],
      terraced: [realEstate?.terraced || false],
      surface: [realEstate?.surface, Validators.required],
      roomCount: [realEstate?.roomCount, Validators.required],
      showerCount: [realEstate?.showerCount],
      terraceCount: [realEstate?.terraceCount],
      hasGarden: [realEstate?.hasGarden || false],
      gardenSurface: [{value: realEstate?.hasGarden, disabled: !(realEstate?.hasGarden)}],
      isSecured: [realEstate?.isSecured || false],
      securityDetail: [{value: realEstate?.securityDetail, disabled: !(realEstate?.securityDetail)}],
      facadeCount: [realEstate?.facadeCount],
      location: [realEstate?.location],
      price: [realEstate?.price, Validators.required],
      priceCurrency: [realEstate?.priceCurrency, Validators.required],
      remark: [realEstate?.remark],
      owners: [realEstate?.owners, Validators.required],
      address: [realEstate?.address || new Address()],
    });

    this.realEstateForm.get('hasGarden')?.valueChanges.subscribe(value => {
      value ? this.realEstateForm.get('gardenSurface')?.enable() : this.realEstateForm.get('gardenSurface')?.disable();
    });

    this.realEstateForm.get('isSecured')?.valueChanges.subscribe(value => {
      value ? this.realEstateForm.get('securityDetail')?.enable() : this.realEstateForm.get('securityDetail')?.disable();
    });

    this.commonService.getSupportedCurrencies().subscribe((currencies: LabelValue<string>[]) => {
      this.supportedCurrencies = currencies;
      if (currencies?.length === 1) {
        this.realEstateForm.get('priceCurrency')!.patchValue(currencies[0].value, {emitEvent: false});
        this.realEstateForm.get('priceCurrency')!.disable();
      }
    });

    this.realEstateService.findAllOwners().subscribe((owners: LabelValue<number>[]) => {
      this.owners = owners;
    });
  }

  onSubmit() {
    const id: number = this.realEstateForm.get('id')!.value;
    if (id > 0) {
      this.realEstateService.update(id, this.realEstateForm.getRawValue()).subscribe((realEstate: RealEstate) => {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      });
    } else {
      this.realEstateService.create(this.realEstateForm.getRawValue()).subscribe((realEstate: RealEstate) => {
        if (realEstate.id > 0) {
          this.realEstateForm.get('id')?.patchValue(realEstate.id, {emitEvent: false})
          this.toasterService.emitValue({
            severity: 'success',
            summary: this.translateService.instant('common.success'),
            detail: this.translateService.instant('common.success_message')
          });
        }
      });
    }
  }
}
