import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { LabelValue } from '../../core/models/label-value.model';
import { CommonService } from '../../core/services/common.service';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { RealEstateService } from '../real-estate.service';
import { RealEstate } from '../model/real-estate';
import { ToasterService } from '../../core/services/toaster.service';
import { RealEstateType } from '../model/real-estate-type.enum';
import { Address } from '../../core/models/address.model';
import { AddressFormComponent } from '../../core/components/address-form/address-form.component';
import { Message } from 'primeng/message';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'primeng/card';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { RealEstatesAttachmentsComponent } from '../real-estates-attachments/real-estates-attachments.component';
import { CanComponentDeactivate, CanDeactivateType } from '../../core/guards/leave-page.guard';
import { Subject } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Media, MediaType } from '../../core/models/media.model';
import { RealEstateOrientation } from '../model/real-estate-orientation.enum';
import { RealEstateAssignment } from '../model/real-estate-assignment.enum';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ks-real-estate-form',
  imports: [
    ConfirmDialog,
    ReactiveFormsModule,
    TranslatePipe,
    Select,
    SelectButton,
    InputText,
    Button,
    Textarea,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    InputNumber,
    MultiSelect,
    AddressFormComponent,
    Message,
    Card,
    PrimeTemplate,
    TableModule,
    RealEstatesAttachmentsComponent,
    NgClass
  ],
  providers: [ConfirmationService],
  templateUrl: './real-estate-form.component.html',
  styleUrl: './real-estate-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RealEstateFormComponent implements OnInit, CanComponentDeactivate {
  realEstateForm!: FormGroup;
  realEstateTypes!: LabelValue<RealEstateType>[];
  realEstateOrientations!: LabelValue<RealEstateOrientation>[];
  realEstateAssignments!: LabelValue<RealEstateAssignment>[];
  booleanOptions!: LabelValue<boolean>[];
  supportedCurrencies: LabelValue<string>[] = [];
  owners: LabelValue<number>[] = [];
  linear = true;
  realEstate?: RealEstate;
  hasPendingPictures = false;
  hasPendingVideo = false;
  hasPendingDocuments = false;
  pictures: Media[] = [];
  videos: Media[] = [];
  documents: Media[] = [];
  RealEstateType = RealEstateType;

  constructor(private fb: FormBuilder,
              private commonService: CommonService,
              private realEstateService: RealEstateService,
              private toasterService: ToasterService,
              private translateService: TranslateService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private confirmationService: ConfirmationService,
  ) {
  }

  canDeactivate(): CanDeactivateType {
    if (this.hasPendingPictures || this.hasPendingDocuments || this.hasPendingVideo) {
      const deactivateSubject = new Subject<boolean>();
      this.confirmationService.confirm({
        message: this.translateService.instant('common.pending_file_warning_message'),
        header: this.translateService.instant('common.confirmation'),
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: this.translateService.instant('common.no'),
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: this.translateService.instant('common.yes'),
          severity: 'danger',
        },
        accept: () => {
          deactivateSubject.next(true);
        },
        reject: () => {
          deactivateSubject.next(false);
        },
      });
      return deactivateSubject;
    } else {
      return true;
    }
  }

  get isAddressInvalid(): boolean {
    if (this.realEstateForm) {
      const address: Address = this.realEstateForm.get('address')!.value;
      if (address.city?.length > 0 && address.countryCode?.length > 0 && (address.street && address.street.length > 0) && address.zipCode?.length > 0) {
        return false;
      }
    }
    return true;
  }

  ngOnInit() {
    this.realEstate = this.activatedRoute.snapshot.data['realEstate'];
    if (this.realEstate) {
      this.linear = false;
    }
    if (this.realEstate && this.realEstate.medias && this.realEstate.medias.length > 0) {
      this.pictures = this.realEstate.medias.filter((m: Media) => m.mediaType === MediaType.IMAGE);
      this.videos = this.realEstate.medias.filter((m: Media) => m.mediaType === MediaType.VIDEO);
      this.documents = this.realEstate.medias.filter((m: Media) => m.mediaType === MediaType.DOCUMENT);
    }
    this.realEstateTypes = this.realEstateService.getRealEstatesTypes();
    this.realEstateOrientations = this.realEstateService.getRealEstateOrientations();
    this.realEstateAssignments = this.realEstateService.getRealEstateAssignments();
    this.booleanOptions = [
      {label: this.translateService.instant('common.yes'), value: true},
      {label: this.translateService.instant('common.no'), value: false}
    ];
    this.realEstateForm = this.fb.group({
      id: [this.realEstate?.id],
      type: [this.realEstate?.type, Validators.required],
      yearOfConstruction: [this.realEstate && this.realEstate!.yearOfConstruction > 0 ? this.realEstate.yearOfConstruction : null, [Validators.required, Validators.min(1900)]],
      terraced: [this.realEstate?.terraced || false],
      surface: [this.realEstate?.surface, Validators.required],
      totalSurface: [this.realEstate?.totalSurface],
      roomCount: [this.realEstate?.roomCount, Validators.required],
      showerCount: [this.realEstate?.showerCount],
      terraceCount: [this.realEstate?.terraceCount],
      floorNumber: [this.realEstate?.floorNumber],
      hasGarden: [this.realEstate?.hasGarden || false],
      gardenSurface: [{value: this.realEstate?.hasGarden, disabled: !(this.realEstate?.hasGarden)}],
      isSecured: [this.realEstate?.isSecured || false],
      securityDetail: [{value: this.realEstate?.securityDetail, disabled: !(this.realEstate?.securityDetail)}],
      facadeCount: [this.realEstate?.facadeCount],
      orientation: [this.realEstate?.orientation],
      assignment: [this.realEstate?.assignment],
      location: [this.realEstate?.location],
      price: [this.realEstate?.price, Validators.required],
      priceCurrency: [this.realEstate?.priceCurrency, Validators.required],
      remark: [this.realEstate?.remark],
      owners: [this.realEstate?.owners, Validators.required],
      address: [this.realEstate?.address || new Address()],
    });

    this.realEstateForm.get('hasGarden')?.valueChanges.subscribe(value => {
      value ? this.realEstateForm.get('gardenSurface')?.enable() : this.realEstateForm.get('gardenSurface')?.disable();
    });

    this.realEstateForm.get('isSecured')?.valueChanges.subscribe(value => {
      value ? this.realEstateForm.get('securityDetail')?.enable() : this.realEstateForm.get('securityDetail')?.disable();
    });

    this.commonService.getSupportedCurrencies().subscribe((currencies: LabelValue<string>[]) => {
      this.supportedCurrencies = currencies;
      if (currencies?.length === 1) {
        this.realEstateForm.get('priceCurrency')!.patchValue(currencies[0].value, {emitEvent: false});
        this.realEstateForm.get('priceCurrency')!.disable();
      }
    });

    this.realEstateService.findAllOwners().subscribe((owners: LabelValue<number>[]) => {
      this.owners = owners;
    });
  }

  onSubmit() {
    const id: number = this.realEstateForm.get('id')!.value;
    if (id > 0) {
      this.realEstateService.update(id, this.realEstateForm.getRawValue()).subscribe();
    } else {
      this.realEstateService.create(this.realEstateForm.getRawValue()).subscribe((realEstate: RealEstate) => {
        if (realEstate.id > 0) {
          this.realEstateForm.get('id')?.patchValue(realEstate.id, {emitEvent: false})
        }
      });
    }
  }

  onFinish(): void {
    if (!this.hasPendingPictures && !this.hasPendingDocuments && !this.hasPendingVideo) {
      this.toasterService.emitValue({
        severity: 'success',
        summary: this.translateService.instant('common.success'),
        detail: this.translateService.instant('common.success_message')
      });
      this.router.navigateByUrl('/real-estates');
    } else {
      this.router.navigateByUrl('/real-estates');
    }
  }
}
