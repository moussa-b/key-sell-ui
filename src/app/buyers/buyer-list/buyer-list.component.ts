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
import { BuyersService } from '../buyers.service';
import { BuyerFormComponent } from '../buyer-form/buyer-form.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToasterService } from '../../core/services/toaster.service';
import { Buyer } from '../entities/buyer.entity';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-buyer-list',
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
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.scss',
  providers: [DialogService, ConfirmationService]
})
export class BuyerListComponent implements OnInit {
  buyers: Buyer[] = [];
  isManagerOrAdmin = false;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private buyersService: BuyersService,
              private translateService: TranslateService,
              private permissionService: PermissionService,
              private toasterService: ToasterService,) {
  }

  ngOnInit(): void {
    this.findAllBuyers();
    this.isManagerOrAdmin = this.permissionService.isManager || this.permissionService.isAdmin;
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

  editBuyer(buyer: Buyer) {
    this.dialogService.open(BuyerFormComponent, {
      data: {buyer: buyer},
      header: this.translateService.instant('buyers.edit_buyer'),
      closable: true,
      modal: true,
    }).onClose.subscribe((updatedBuyer: Buyer) => {
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

  deleteBuyer(buyerId: number, event: MouseEvent) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
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
}
