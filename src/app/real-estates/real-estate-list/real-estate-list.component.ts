import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import {
  ConfirmationService,
  FilterService,
  FilterMatchMode,
  MenuItem,
  MenuItemCommandEvent,
  PrimeIcons,
  FilterOperator
} from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Card } from 'primeng/card';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
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
import { AddressService } from '../../core/services/address.service';
import { MultiSelect } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RealEstateType } from '../model/real-estate-type.enum';
import { PrimeNG } from 'primeng/config';
import { Subscription } from 'rxjs';
type uiFields = {concatenedAddress?: string; formatedType?: string; concatenedOwners?: string;};

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
    AddressPipe,
    MultiSelect,
    FormsModule,
    DropdownModule
  ],
  templateUrl: './real-estate-list.component.html',
  styleUrl: './real-estate-list.component.scss',
  providers: [ConfirmationService, DialogService],
  encapsulation: ViewEncapsulation.None
})
export class RealEstateListComponent implements OnInit, OnDestroy {
  realEstates: (RealEstate & uiFields)[] = [];
  userAccess!: UserAccess;
  items!: MenuItem[];
  selectedRealEstate?: RealEstate;
  owners: LabelValue<number>[] = [];
  realEstateTypes!: LabelValue<RealEstateType>[];
  FilterMatchMode: typeof FilterMatchMode = FilterMatchMode;
  FilterOperator: typeof FilterOperator = FilterOperator;
  private langChangeSubscription!: Subscription;

  constructor(private dialogService: DialogService,
              private confirmationService: ConfirmationService,
              private realEstateService: RealEstateService,
              public translateService: TranslateService,
              private elementRef: ElementRef,
              private permissionService: PermissionService,
              private toasterService: ToasterService,
              private filterService: FilterService,
              private config: PrimeNG) {
  }

  ngOnInit(): void {
    this.translateService.get('prime_ng').subscribe(res => this.config.setTranslation(res));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.get('prime_ng').subscribe(res => this.config.setTranslation(res));
    });
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
    this.realEstateTypes = this.realEstateService.getRealEstatesTypes();
    this.findAllRealEstates();
    this.filterService.register('owners', (owners: LabelValue<number>[], filter: number[]): boolean => {
      if (!filter || filter.length === 0) {
        return true;
      }
      for (let owner of owners) {
        if (filter.includes(owner.value)) {
          return true;
        }
      }
      return false;
    });
    this.filterService.register('realEstateTypes', (type: RealEstateType, filter: RealEstateType[]): boolean => {
      if (!filter || filter.length === 0) {
        return true;
      }
      return filter.includes(type);
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private findAllRealEstates(): void {
    this.realEstateService.findAll().subscribe((realEstates: RealEstate[]) => {
      const addedOwnersId: number[] = [];
      this.owners = [];
      this.realEstates = (realEstates || []).map((realEstate: RealEstate) => {
        let concatenedOwners = '';
        if (realEstate.ownersDetails && realEstate.ownersDetails.length > 0) {
          concatenedOwners = realEstate.ownersDetails!.map((owner: LabelValue<number>) => owner.label).join(' ');
          realEstate.ownersDetails.forEach((owner: LabelValue<number>) => {
            if (!addedOwnersId.includes(owner.value)) {
              this.owners.push(owner);
              addedOwnersId.push(owner.value);
            }
          })
        }
        return {
          ...realEstate,
          concatenedAddress: AddressService.format(realEstate.address),
          concatenedOwners: concatenedOwners,
          formatedType: this.realEstateService.getRealEstateFormatedType(realEstate.type)
        }
      });
      if (this.owners.length > 0) {
        this.owners.sort((owner1: LabelValue<number>, owner2: LabelValue<number>) => owner1.label.localeCompare(owner2.label))
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
            this.realEstates = this.realEstates.filter((u: RealEstate & uiFields) => u.id !== realEstateId);
          }
        });
      }
    });
  }
}
