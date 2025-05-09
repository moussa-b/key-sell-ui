import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Sex } from '../../core/models/sex.enum';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SellersService } from '../sellers.service';
import { Seller } from '../entities/seller.entity';
import { Select } from 'primeng/select';
import { AddressFormComponent } from '../../core/components/address-form/address-form.component';
import { Address } from '../../core/models/address.model';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { IdentityDocumentsComponent } from '../../core/components/identity-documents/identity-documents.component';

@Component({
  selector: 'ks-seller-form',
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
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    IdentityDocumentsComponent
  ],
  templateUrl: './seller-form.component.html',
})
export class SellerFormComponent implements OnInit {
  sellerForm!: FormGroup;
  sexOptions!: SelectItem<Sex>[];
  preferredLanguageOptions!: SelectItem<string>[];
  private identityDocuments: File[] = [];
  seller?: Seller;

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private sellersService: SellersService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig) {
  }

  ngOnInit(): void {
    this.seller = this.dialogConfig.data?.seller;
    this.sellerForm = this.fb.group({
      id: [this.seller?.id],
      lastName: [this.seller?.lastName, Validators.required],
      firstName: [this.seller?.firstName, Validators.required],
      email: [this.seller?.email, [Validators.required, Validators.email]],
      phone: [this.seller?.phone],
      sex: [this.seller?.sex || Sex.MALE],
      preferredLanguage: [this.seller ? this.seller.preferredLanguage : 'fr'],
      address: [this.seller?.address || new Address()],
    });
    this.sexOptions = [
      {label: this.translateService.instant('common.man'), value: Sex.MALE},
      {label: this.translateService.instant('common.woman'), value: Sex.FEMALE},
    ];
    this.preferredLanguageOptions = [
      {label: this.translateService.instant('common.french'), value: 'fr'},
      {label: this.translateService.instant('common.english'), value: 'en'},
    ];
  }

  onSubmit(): void {
    if (this.sellerForm.valid) {
      let sellerFormValue = this.sellerForm.getRawValue();
      const observable = sellerFormValue.id > 0 ? this.sellersService.update(sellerFormValue.id, sellerFormValue, this.identityDocuments) : this.sellersService.create(sellerFormValue, this.identityDocuments);
      observable.subscribe((seller: Seller) => {
        if (seller && seller.id! > 0) {
          this.dialogRef.close(seller);
        }
      });
    }
  }

  onPendingFilesChange(identityDocuments: File[]) {
    this.identityDocuments = identityDocuments;
  }

  onRemoveMedia(uuid: string) {
    if (this.dialogConfig.data && typeof this.dialogConfig.data.onRemoveMedia === 'function') {
      this.dialogConfig.data.onRemoveMedia(this.seller, uuid);
    }
  }
}
