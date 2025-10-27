import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import {
  ConfirmationService,
  FilterMatchMode,
  FilterOperator,
  FilterService,
  MenuItem,
  MenuItemCommandEvent,
  PrimeIcons
} from 'primeng/api';
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
import { AddressPipe } from '../../core/pipes/address.pipe';
import { LabelValue } from '../../core/models/label-value.model';
import { AddressService } from '../../core/services/address.service';
import { MultiSelect } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { RealEstateType } from '../model/real-estate-type.enum';
import { PrimeNG } from 'primeng/config';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { RealEstatesRecordComponent } from '../real-estates-record/real-estates-record.component';
import { Dialog } from 'primeng/dialog';
import { RealEstateStatus } from '../model/real-estate-status.enum';
import { RealEstateStatusTagComponent } from '../real-estate-status-tag/real-estate-status-tag.component';
import { UpdateStatusFormComponent } from '../update-status-form/update-status-form.component';
import { DialogService } from 'primeng/dynamicdialog';
import { RealEstatesTaskListComponent } from '../real-estates-task-list/real-estates-task-list.component';
import { UtilsService } from '../../core/services/utils.service';

type uiFields = {concatenedAddress?: string; formattedType?: string; concatenedOwners?: string; formattedStatus?: string;};

@Component({
  selector: 'ks-real-estate-list',
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
    Dialog,
    RealEstatesRecordComponent,
    RealEstateStatusTagComponent
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
  realEstateStatusOptions: LabelValue<RealEstateStatus>[] = [];
  realEstateTypes!: LabelValue<RealEstateType>[];
  FilterMatchMode: typeof FilterMatchMode = FilterMatchMode;
  FilterOperator: typeof FilterOperator = FilterOperator;
  private langChangeSubscription!: Subscription;
  showDialog = false;
  readonly PrimeIcons = PrimeIcons;

  constructor(private confirmationService: ConfirmationService,
              private realEstateService: RealEstateService,
              public translateService: TranslateService,
              private elementRef: ElementRef,
              private permissionService: PermissionService,
              private toasterService: ToasterService,
              private filterService: FilterService,
              private router: Router,
              private dialogService: DialogService,
              private config: PrimeNG) {
  }

  ngOnInit(): void {
    this.translateService.get('prime_ng').subscribe(res => this.config.setTranslation(res));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.get('prime_ng').subscribe(res => this.config.setTranslation(res));
      this.initializeMenu();
    });
    this.userAccess = this.permissionService.getUserAccess();
    this.initializeMenu();
    this.realEstateTypes = this.realEstateService.getRealEstatesTypes();
    this.realEstateStatusOptions = this.realEstateService.getRealEstatesStatusOptions();
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
    this.filterService.register('multiSelectMatchMode', UtilsService.matchesFilter);
    this.filterService.register('multiSelectLabelValueMatchMode', UtilsService.matchesLabelValueFilter);
  }

  private initializeMenu() {
    this.items = [
      {
        label: this.translateService.instant('real_estates.see_description_sheet'),
        icon: PrimeIcons.EYE,
        command: () => this.openRealEstateRecord(),
      },
      {
        label: this.translateService.instant('tasks.manage_tasks'),
        icon: PrimeIcons.LIST_CHECK,
        command: () => this.openRealEstateTasks(),
        visible: this.userAccess.canShowTasks
      },
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.PEN_TO_SQUARE,
        command: () => this.editRealEstate(),
        visible: this.userAccess.canEditRealEstates
      },
      {
        label: this.translateService.instant('common.change_status'),
        icon: PrimeIcons.CHECK_SQUARE,
        command: () => this.updateRealEstateStatus(),
        visible: this.userAccess.canEditRealEstates
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteRealEstate(menuEvent.originalEvent!),
        visible: this.userAccess.canEditRealEstates
      },
    ].filter((m: MenuItem) => m.visible !== false);
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private findAllRealEstates(): void {
    this.realEstateService.findAll().subscribe((realEstates: RealEstate[]) => {
      this.owners = [];
      this.realEstates = (realEstates || []).map((realEstate: RealEstate) => {
        return this.formatRealEstateForTable(realEstate);
      });
      if (this.owners.length > 0) {
        this.owners.sort((owner1: LabelValue<number>, owner2: LabelValue<number>) => owner1.label.localeCompare(owner2.label))
      }
    });
  }

  private formatRealEstateForTable(realEstate: RealEstate) {
    let concatenedOwners = '';
    if (realEstate.ownersDetails && realEstate.ownersDetails.length > 0) {
      concatenedOwners = realEstate.ownersDetails!.map((owner: LabelValue<number>) => owner.label).join(' ');
      realEstate.ownersDetails.forEach((owner: LabelValue<number>) => {
        if (!this.owners.some((item: LabelValue<number>) => item.value === owner.value)) {
          this.owners.push(owner);
        }
      })
    }
    return {
      ...realEstate,
      concatenedAddress: AddressService.format(realEstate.address),
      concatenedOwners: concatenedOwners,
      formattedType: this.realEstateService.getRealEstateFormatedType(realEstate.type),
      formattedStatus: this.realEstateService.getRealEstateFormattedStatus(realEstate.status),
    }
  }

  openNew(): void {
    this.router.navigateByUrl('/real-estates/new');
  }

  editRealEstate() {
    this.router.navigateByUrl(`/real-estates/${this.selectedRealEstate!.id}/edit`);
  }

  updateRealEstateStatus() {
    this.dialogService.open(UpdateStatusFormComponent, {
      header: this.translateService.instant('common.change_status'),
      data: {realEstate: this.selectedRealEstate},
      closeOnEscape: false,
      closable: true,
      modal: true,
    })?.onClose.subscribe((realEstate: RealEstate) => {
      this.selectedRealEstate = undefined;
      if (realEstate) {
        this.onStatusChange(realEstate);
      }
    });
  }

  openRealEstateTasks() {
    this.dialogService.open(RealEstatesTaskListComponent, {
      header: this.translateService.instant('tasks.task_management'),
      data: {realEstate: this.selectedRealEstate},
      closeOnEscape: false,
      closable: true,
      modal: true,
      width: '80%',
      height: '80%',
    });
  }

  onStatusChange(updatedRealEstate: RealEstate) {
    this.realEstates = this.realEstates.map((realEstate: (RealEstate & uiFields)) => {
      if (realEstate.id === updatedRealEstate.id) {
        return this.formatRealEstateForTable(updatedRealEstate);
      } else {
        return {...realEstate}
      }
    });
  }

  openRealEstateRecord() {
    this.showDialog = true;
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

  downloadRealEstateDetail(realEstateId: number) {
    this.realEstateService.export(realEstateId);
  }
}
