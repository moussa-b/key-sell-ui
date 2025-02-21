import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, PrimeIcons } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Card } from 'primeng/card';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { ToasterService } from '../../core/services/toaster.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserAccess } from '../../core/models/user-access.model';
import { Menu } from 'primeng/menu';
import { RealEstateService } from '../real-estate.service';
import { RealEstate } from '../model/real-estate';
import { RealEstateFormComponent } from '../real-estate-form/real-estate-form.component';
import { AddressPipe } from '../../core/pipes/address.pipe';
import { LabelValue } from '../../core/models/label-value.model';

@Component({
  selector: 'app-real-estate-list',
  imports: [
    TableModule,
    ConfirmPopupModule,
    Button,
    IconField,
    InputIcon,
    Card,
    TranslatePipe,
    InputText,
    Menu,
    AddressPipe
  ],
  templateUrl: './real-estate-list.component.html',
  styleUrl: './real-estate-list.component.scss',
  providers: [ConfirmationService, DialogService],
  encapsulation: ViewEncapsulation.None
})
export class RealEstateListComponent implements OnInit {
  realEstates: RealEstate[] = [];
  isAdmin = false;
  userAccess!: UserAccess;
  items!: MenuItem[];
  selectedRealEstate?: RealEstate;
  private owners?: LabelValue<number>[];
  ownersDictionary: { [key: number]: string } = {};

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private realEstateService: RealEstateService,
              private translateService: TranslateService,
              private elementRef: ElementRef,
              private permissionService: PermissionService,
              private toasterService: ToasterService,) {
  }

  ngOnInit(): void {
    this.userAccess = this.permissionService.getUserAccess();
    this.items = [
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.PEN_TO_SQUARE,
        command: () => this.editRealEstate(),
        visible: this.userAccess.canEditRealEstate
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteRealEstate(menuEvent.originalEvent!)
      },
    ].filter((m: MenuItem) => m.visible !== false);
    this.findAllRealEstates();
    this.isAdmin = this.permissionService.isAdmin
  }

  private findAllRealEstates(): void {
    this.realEstateService.findAll().subscribe((realEstates: RealEstate[]) => {
      this.realEstates = realEstates || [];
      if (this.realEstates.length > 0) {
        this.findAllOwners();
      }
    });
  }

  private findAllOwners() {
    this.realEstateService.findAllOwners().subscribe((owners: LabelValue<number>[]) => {
      this.owners = owners || [];
      this.ownersDictionary = {};
      if (this.owners.length > 0) {
        this.owners.forEach((owner: LabelValue<number>) => this.ownersDictionary[owner.value] = owner.label)
      }
    });
  }

  openNew(): void {
    this.dialogService.open(RealEstateFormComponent, {
      header: this.translateService.instant('real_estates.add_real_estate'),
      closable: true,
      closeOnEscape: false,
      modal: true,
    }).onClose.subscribe((realEstate: RealEstate) => {
      this.findAllRealEstates();
      if (realEstate) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  editRealEstate() {
    this.dialogService.open(RealEstateFormComponent, {
      data: {realEstate: this.selectedRealEstate},
      header: this.translateService.instant('real_estates.edit_real_estate'),
      closeOnEscape: false,
      closable: true,
      modal: true,
    }).onClose.subscribe((realEstate: RealEstate) => {
      this.selectedRealEstate = undefined;
      this.findAllRealEstates();
      if (realEstate) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  deleteRealEstate(event: Event) {
    const realEstateId = this.selectedRealEstate!.id!;
    this.selectedRealEstate = undefined;
    const button = this.elementRef.nativeElement.querySelector(`tr[data-real-estate-id='${realEstateId}'] button`);
    this.confirmationService.confirm({
      target: button || event?.target as EventTarget,
      message: this.translateService.instant('real_estates.delete_real_estate_confirmation_message'),
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
        this.realEstateService.remove(realEstateId).subscribe((result: boolean) => {
          if (result) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
            this.realEstates = this.realEstates.filter((u: RealEstate) => u.id !== realEstateId);
          }
        });
      }
    });
  }
}
