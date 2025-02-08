import { Component, ElementRef, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, PrimeIcons, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { SellersService } from '../sellers.service';
import { SellerFormComponent } from '../seller-form/seller-form.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToasterService } from '../../core/services/toaster.service';
import { Seller } from '../entities/seller.entity';
import { PermissionService } from '../../core/services/permission.service';
import { UserAccess } from '../../core/models/user-access.model';
import { Menu } from 'primeng/menu';
import { UpperCasePipe } from '@angular/common';

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
    Menu,
    UpperCasePipe,
  ],
  templateUrl: './seller-list.component.html',
  styleUrl: './seller-list.component.scss',
  providers: [DialogService, ConfirmationService]
})
export class SellerListComponent implements OnInit {
  sellers: Seller[] = [];
  isManagerOrAdmin = false;
  userAccess!: UserAccess;
  items!: MenuItem[];
  selectedSeller?: Seller;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private sellersService: SellersService,
              private translateService: TranslateService,
              private permissionService: PermissionService,
              private elementRef: ElementRef,
              private toasterService: ToasterService,) {
  }

  ngOnInit(): void {
    this.userAccess = this.permissionService.getUserAccess();
    this.findAllSellers();
    this.isManagerOrAdmin = this.permissionService.isManager || this.permissionService.isAdmin;
    this.items = [
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.USER_EDIT,
        command: () => this.editSeller()
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteSeller(menuEvent.originalEvent!)
      }
    ];
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

  editSeller() {
    this.dialogService.open(SellerFormComponent, {
      data: {seller: this.selectedSeller},
      header: this.translateService.instant('sellers.edit_seller'),
      closable: true,
      modal: true,
    }).onClose.subscribe((updatedSeller: Seller) => {
      this.selectedSeller = undefined;
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

  deleteSeller(event: Event) {
    const sellerId = this.selectedSeller!.id;
    this.selectedSeller = undefined;
    const button = this.elementRef.nativeElement.querySelector(`tr[data-seller-id='${sellerId}'] button`);
    this.confirmationService.confirm({
      target: button || event.target as EventTarget,
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
