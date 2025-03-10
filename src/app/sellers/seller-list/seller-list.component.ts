import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, PrimeIcons, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
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
import { SendEmailComponent } from '../../core/components/send-email/send-email.component';
import { SendEmailModel } from '../../core/models/send-email.model';
import { ResponseStatus } from '../../core/models/response-status.model';
import {Clipboard} from '@angular/cdk/clipboard';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ks-seller-list',
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
export class SellerListComponent implements OnInit, OnDestroy {
  sellers: Seller[] = [];
  isManagerOrAdmin = false;
  userAccess!: UserAccess;
  items!: MenuItem[];
  selectedSeller?: Seller;
  private langChangeSubscription!: Subscription;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private sellersService: SellersService,
              private translateService: TranslateService,
              private permissionService: PermissionService,
              private elementRef: ElementRef,
              private toasterService: ToasterService,
              private clipboard: Clipboard) {
  }

  ngOnInit(): void {
    this.userAccess = this.permissionService.getUserAccess();
    this.findAllSellers();
    this.isManagerOrAdmin = this.permissionService.isManager || this.permissionService.isAdmin;
    this.initializeMenu();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initializeMenu();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private initializeMenu() {
    this.items = [
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.USER_EDIT,
        command: () => this.editSeller(),
        visible: this.userAccess.canEditSellers
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteSeller(menuEvent.originalEvent!),
        visible: this.userAccess.canEditSellers
      },
      {
        label: this.translateService.instant('common.send_email'),
        icon: PrimeIcons.ENVELOPE,
        command: () => this.sendEmailToSeller(),
        visible: this.userAccess.canSendEmail
      }
    ].filter((m: MenuItem) => m.visible !== false)
  }

  private findAllSellers(): void {
    this.sellersService.findAll().subscribe((sellers: Seller[]) => {
      this.sellers = sellers || [];
    });
  }

  openNew(): void {
    this.dialogService.open(SellerFormComponent, {
      header: this.translateService.instant('sellers.add_seller'),
      closeOnEscape: false,
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
      closeOnEscape: false,
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

  sendEmailToSeller() {
    this.dialogService.open(SendEmailComponent, {
      header: this.translateService.instant('common.send_email_to', {recipient: `${this.selectedSeller!.lastName.toUpperCase()} ${this.selectedSeller!.firstName}`}),
      closeOnEscape: false,
      closable: true,
      modal: true,
    }).onClose.subscribe((sendEmailModel: SendEmailModel) => {
      if (sendEmailModel) {
        this.sellersService.sendEmail(this.selectedSeller!.id, sendEmailModel).subscribe((res: ResponseStatus) => {
          if (res.status) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
          }
        });
      }
      this.selectedSeller = undefined;
    });
  }

  copyToClipboard(text: string): void {
    this.clipboard.copy(text);
    this.toasterService.emitValue({
      severity: 'success',
      summary: this.translateService.instant('common.success'),
      detail: this.translateService.instant('common.success_message')
    });
  }
}
