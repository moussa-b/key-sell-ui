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
import { BuyersService } from '../buyers.service';
import { BuyerFormComponent } from '../buyer-form/buyer-form.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToasterService } from '../../core/services/toaster.service';
import { Buyer } from '../entities/buyer.entity';
import { PermissionService } from '../../core/services/permission.service';
import { UserAccess } from '../../core/models/user-access.model';
import { Menu } from 'primeng/menu';
import { UpperCasePipe } from '@angular/common';
import { SendEmailComponent } from '../../core/components/send-email/send-email.component';
import { SendEmailModel } from '../../core/models/send-email.model';
import { ResponseStatus } from '../../core/models/response-status.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ks-buyer-list',
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
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.scss',
  providers: [DialogService, ConfirmationService]
})
export class BuyerListComponent implements OnInit, OnDestroy {
  buyers: Buyer[] = [];
  isManagerOrAdmin = false;
  userAccess!: UserAccess;
  items!: MenuItem[];
  selectedBuyer?: Buyer;
  private langChangeSubscription!: Subscription;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private buyersService: BuyersService,
              private translateService: TranslateService,
              private permissionService: PermissionService,
              private elementRef: ElementRef,
              private toasterService: ToasterService,
              private clipboard: Clipboard) {
  }

  ngOnInit(): void {
    this.userAccess = this.permissionService.getUserAccess();
    this.findAllBuyers();
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
        command: () => this.editBuyer(),
        visible: this.userAccess.canEditSellers
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteBuyer(menuEvent.originalEvent!),
        visible: this.userAccess.canEditSellers
      },
      {
        label: this.translateService.instant('common.send_email'),
        icon: PrimeIcons.ENVELOPE,
        command: () => this.sendEmailToBuyer(),
        visible: this.userAccess.canSendEmail
      }
    ].filter((m: MenuItem) => m.visible !== false);
  }

  private findAllBuyers(): void {
    this.buyersService.findAll().subscribe((buyers: Buyer[]) => {
      this.buyers = buyers || [];
    });
  }

  openNew(): void {
    this.dialogService.open(BuyerFormComponent, {
      header: this.translateService.instant('buyers.add_buyer'),
      closable: true,
      closeOnEscape: false,
      modal: true,
    }).onClose.subscribe((buyer: Buyer) => {
      if (buyer) {
        this.findAllBuyers();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  editBuyer() {
    this.dialogService.open(BuyerFormComponent, {
      data: {buyer: this.selectedBuyer},
      header: this.translateService.instant('buyers.edit_buyer'),
      closable: true,
      closeOnEscape: false,
      modal: true,
    }).onClose.subscribe((updatedBuyer: Buyer) => {
      this.selectedBuyer = undefined;
      if (updatedBuyer) {
        this.findAllBuyers();
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  deleteBuyer(event: Event) {
    const buyerId = this.selectedBuyer!.id;
    this.selectedBuyer = undefined;
    const button = this.elementRef.nativeElement.querySelector(`tr[data-buyer-id='${buyerId}'] button`);
    this.confirmationService.confirm({
      target: button || event.target as EventTarget,
      message: this.translateService.instant('buyers.delete_buyer_confirmation_message'),
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
        this.buyersService.remove(buyerId).subscribe((result: boolean) => {
          if (result) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
            this.buyers = this.buyers.filter((u: Buyer) => u.id !== buyerId);
          }
        });
      }
    });
  }

  sendEmailToBuyer() {
    this.dialogService.open(SendEmailComponent, {
      header: this.translateService.instant('common.send_email_to', { recipient: `${this.selectedBuyer!.lastName.toUpperCase()} ${this.selectedBuyer!.firstName}` }),
      closable: true,
      closeOnEscape: false,
      modal: true,
    }).onClose.subscribe((sendEmailModel: SendEmailModel) => {
      if (sendEmailModel) {
        this.buyersService.sendEmail(this.selectedBuyer!.id, sendEmailModel).subscribe((res: ResponseStatus) => {
          if (res.status) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
          }
        });
      }
      this.selectedBuyer = undefined;
    });
  }

  copyToClipboard(text: string): void {
    this.clipboard.copy(text);
    this.toasterService.emitValue({
      severity: 'info',
      summary: this.translateService.instant('common.information'),
      detail: this.translateService.instant('common.success_copy')
    });
  }
}
