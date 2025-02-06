import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from '../../core/services/auth.service';
import { SellersService } from '../sellers.service';
import { SellerFormComponent } from '../seller-form/seller-form.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToasterService } from '../../core/services/toaster.service';
import { Seller } from '../entities/seller.entity';

@Component({
  selector: 'app-seller-list',
  imports: [
    Button,
    Card,
    IconField,
    InputIcon,
    InputText,
    PrimeTemplate,
    TableModule,
    TranslatePipe,
    ConfirmPopupModule,
  ],
  templateUrl: './seller-list.component.html',
  styleUrl: './seller-list.component.scss',
  providers: [DialogService, ConfirmationService]
})
export class SellerListComponent implements OnInit {
  sellers: Seller[] = [];
  isManagerOrAdmin = false;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private sellersService: SellersService,
              private translateService: TranslateService,
              private authService: AuthService,
              private toasterService: ToasterService,) {
  }

  ngOnInit(): void {
    this.findAllSellers();
    this.isManagerOrAdmin = this.authService.isManager || this.authService.isAdmin;
  }

  private findAllSellers(): void {
    this.sellersService.findAll().subscribe((sellers: Seller[]) => {
      this.sellers = sellers || [];
    });
  }

  openNew(): void {
    this.dialogService.open(SellerFormComponent, {
      header: this.translateService.instant('sellers.add_seller'),
      closable: true,
      modal: true,
    }).onClose.subscribe((seller: Seller) => {
      if (seller) {
        this.findAllSellers();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  editSeller(seller: Seller) {
    this.dialogService.open(SellerFormComponent, {
      data: {seller: seller},
      header: this.translateService.instant('sellers.edit_seller'),
      closable: true,
      modal: true,
    }).onClose.subscribe((updatedSeller: Seller) => {
      if (updatedSeller) {
        this.findAllSellers();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  deleteSeller(sellerId: number, event: MouseEvent) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('sellers.delete_seller_confirmation_message'),
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: this.translateService.instant('common.cancel'),
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: this.translateService.instant('common.delete'),
        severity: 'danger'
      },
      accept: () => {
        this.sellersService.remove(sellerId).subscribe((result: boolean) => {
          if (result) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
            this.sellers = this.sellers.filter((u: Seller) => u.id !== sellerId);
          }
        });
      }
    });
  }
}
