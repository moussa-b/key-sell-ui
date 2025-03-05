import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Sex } from '../../core/models/sex.enum';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BuyersService } from '../buyers.service';
import { Buyer } from '../entities/buyer.entity';
import { Select } from 'primeng/select';
import { AddressFormComponent } from '../../core/components/address-form/address-form.component';
import { Address } from '../../core/models/address.model';
import { CommonService } from '../../core/services/common.service';
import { LabelValue } from '../../core/models/label-value.model';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'ks-buyer-form',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    SelectButton,
    TranslatePipe,
    Select,
    AddressFormComponent,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    InputNumber
  ],
  templateUrl: './buyer-form.component.html',
})
export class BuyerFormComponent implements OnInit {
  buyerForm!: FormGroup;
  sexOptions!: SelectItem<Sex>[];
  preferredLanguageOptions!: SelectItem<string>[];
  supportedCurrencies: LabelValue<string>[] = [];

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private buyersService: BuyersService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig,
              private commonService: CommonService) {}

  ngOnInit(): void {
    const buyer: Buyer | undefined = this.dialogConfig.data?.buyer;
    this.buyerForm = this.fb.group({
      id: [buyer?.id],
      lastName: [buyer?.lastName, Validators.required],
      firstName: [buyer?.firstName, Validators.required],
      email: [buyer?.email, [Validators.required, Validators.email]],
      phone: [buyer?.phone],
      sex: [buyer?.sex || Sex.MALE],
      preferredLanguage: [buyer ? buyer.preferredLanguage : 'fr'],
      address: [buyer?.address || new Address()],
      budget: [buyer?.budget],
      budgetCurrency: [buyer?.budgetCurrency],
    });
    this.sexOptions= [
      { label: this.translateService.instant('common.man'), value: Sex.MALE },
      { label: this.translateService.instant('common.woman'), value: Sex.FEMALE },
    ];
    this.preferredLanguageOptions= [
      { label: this.translateService.instant('common.french'), value: 'fr' },
      { label: this.translateService.instant('common.english'), value: 'en' },
    ];
    this.commonService.getSupportedCurrencies().subscribe((currencies: LabelValue<string>[]) => {
      this.supportedCurrencies = currencies;
      if (currencies?.length === 1) {
        this.buyerForm.get('budgetCurrency')!.patchValue(currencies[0].value, {emitEvent: false});
        this.buyerForm.get('budgetCurrency')!.disable();
      }
    });
  }

  onSubmit(): void {
    if (this.buyerForm.valid) {
      let buyerFormValue = this.buyerForm.getRawValue();
      const observable = buyerFormValue.id > 0 ? this.buyersService.update(buyerFormValue.id, buyerFormValue) : this.buyersService.create(buyerFormValue);
      observable.subscribe((buyer: Buyer) => {
        if (buyer && buyer.id! > 0) {
          this.dialogRef.close(buyer);
        }
      });
    }
  }

}
