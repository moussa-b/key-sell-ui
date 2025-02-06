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
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-seller-form',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    SelectButton,
    TranslatePipe,
    Textarea,
    Select
  ],
  templateUrl: './seller-form.component.html',
  styleUrl: './seller-form.component.scss'
})
export class SellerFormComponent implements OnInit {
  sellerForm!: FormGroup;
  sexOptions!: SelectItem<Sex>[];
  preferredLanguageOptions!: SelectItem<string>[];

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private sellersService: SellersService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig) {}

  ngOnInit(): void {
    const seller: Seller | undefined = this.dialogConfig.data?.seller;
    this.sellerForm = this.fb.group({
      id: [seller?.id],
      lastName: [seller?.lastName, Validators.required],
      firstName: [seller?.firstName, Validators.required],
      email: [seller?.email, [Validators.required, Validators.email]],
      phone: [seller?.phone],
      sex: [seller?.sex || Sex.MALE],
      preferredLanguage: [seller ? seller.preferredLanguage : 'fr'],
      address: [seller?.address],
    });
    this.sexOptions= [
      { label: this.translateService.instant('common.man'), value: Sex.MALE },
      { label: this.translateService.instant('common.woman'), value: Sex.FEMALE },
    ];
    this.preferredLanguageOptions= [
      { label: this.translateService.instant('common.french'), value: 'fr' },
      { label: this.translateService.instant('common.english'), value: 'en' },
    ];
  }

  onSubmit(): void {
    if (this.sellerForm.valid) {
      let sellerFormValue = this.sellerForm.getRawValue();
      const observable = sellerFormValue.id > 0 ? this.sellersService.update(sellerFormValue.id, sellerFormValue) : this.sellersService.create(sellerFormValue);
      observable.subscribe((seller: Seller) => {
        if (seller && seller.id! > 0) {
          this.dialogRef.close(seller);
        }
      });
    }
  }

}
