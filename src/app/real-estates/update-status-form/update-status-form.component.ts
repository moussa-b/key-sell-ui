import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RealEstateStatus } from '../model/real-estate-status.enum';
import { LabelValue } from '../../core/models/label-value.model';
import { RealEstateService } from '../real-estate.service';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Textarea } from 'primeng/textarea';
import { ToasterService } from '../../core/services/toaster.service';
import { RealEstate } from '../model/real-estate';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { CommonService } from '../../core/services/common.service';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelect } from 'primeng/multiselect';
import { Subscription } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'ks-update-status-form',
  imports: [
    Button,
    ReactiveFormsModule,
    SelectButton,
    TranslatePipe,
    Textarea,
    InputNumber,
    Select,
    DatePicker,
    MultiSelect
  ],
  templateUrl: './update-status-form.component.html'
})
export class UpdateStatusFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  realEstateStatusOptions: LabelValue<RealEstateStatus>[] = [];
  realEstate!: RealEstate;
  RealEstateStatus = RealEstateStatus;
  supportedCurrencies: LabelValue<string>[] = [];
  buyers: LabelValue<number>[] = [];
  valueChangeSubscription?: Subscription;

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private realEstateService: RealEstateService,
              private toasterService: ToasterService,
              private commonService: CommonService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig) {
  }

  ngOnInit(): void {
    this.realEstate = this.dialogConfig.data.realEstate;
    this.realEstateStatusOptions = this.realEstateService.getRealEstatesStatusOptions();
    let saleDate = undefined;
    if (this.realEstate.saleDate) {
      const [year, month, day] = this.realEstate.saleDate.split("T")[0].split("-");
      saleDate = `${day}.${month}.${year}`;
    }
    this.form = this.fb.group({
      status: [this.realEstate.status],
      statusRemark: [this.realEstate.statusRemark],
      finalSellingPrice: [this.realEstate.finalSellingPrice],
      saleDate: [saleDate, this.realEstate.status === RealEstateStatus.SOLD ? Validators.required : undefined],
      priceCurrency: [this.realEstate.priceCurrency],
      buyers: [this.realEstate.buyers]
    });
    this.valueChangeSubscription = this.form.get('status')!.valueChanges.subscribe((value) => {
      this.onChangeStatus(value);
    });
    this.form.get('priceCurrency')!.disable();
    this.commonService.getSupportedCurrencies().subscribe((currencies: LabelValue<string>[]) => {
      this.supportedCurrencies = currencies;
    });
    this.realEstateService.findAllBuyers().subscribe((buyers: LabelValue<number>[]) => {
      this.buyers = buyers;
    });
  }

  ngOnDestroy(): void {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }

  onSubmit() {
    this.realEstateService.updateStatus(this.realEstate.id, this.form.value).subscribe((realEstate: RealEstate) => {
      if (realEstate) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
        this.dialogRef.close(realEstate);
      }
    });
  }

  private onChangeStatus(status: RealEstateStatus): void {
    if (status === RealEstateStatus.SOLD) {
      this.form.get('saleDate')!.setValidators(Validators.required);
      this.form.get('saleDate')!.enable();
      this.form.get('finalSellingPrice')!.enable();
      this.form.get('buyers')!.enable();
    } else {
      this.form.get('saleDate')!.clearValidators();
      this.form.get('saleDate')!.disable();
      this.form.get('finalSellingPrice')!.disable();
      this.form.get('buyers')!.disable();
    }
    this.form.get('saleDate')!.updateValueAndValidity();
  }
}
