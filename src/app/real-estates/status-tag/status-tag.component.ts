import { Component, Input } from '@angular/core';
import { RealEstateStatus } from '../model/real-estate-status.enum';
import { RealEstateService } from '../real-estate.service';
import { Tag } from 'primeng/tag';
import { Popover } from 'primeng/popover';
import { DatePipe, NgClass } from '@angular/common';
import { RealEstate } from '../model/real-estate';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LabelValue } from '../../core/models/label-value.model';

@Component({
  selector: 'ks-status-tag',
  imports: [
    Tag,
    Popover,
    NgClass,
    ReactiveFormsModule,
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './status-tag.component.html'
})
export class StatusTagComponent {
  private _realEstate!: RealEstate;
  @Input({required: true}) set realEstate(realEstate: RealEstate) {
    this._realEstate = realEstate;
    this.tagValue = this.realEstateService.getRealEstateFormatedStatus(realEstate.status);
    switch (realEstate.status) {
      case RealEstateStatus.FOR_SALE:
        this.tagSeverity = 'info';
        break;
      case RealEstateStatus.SALE_IN_PROGRESS:
        this.tagSeverity = 'warn';
        break;
      case RealEstateStatus.SOLD:
        this.tagSeverity = 'success';
        break;
      default:
        this.tagSeverity = 'secondary';
        break;
    }
    if (realEstate.statusRemark || realEstate.status === RealEstateStatus.SOLD &&
      (realEstate.saleDate || (realEstate.buyersDetails && realEstate.buyersDetails.length > 0))) {
      this.showPopover = true;
    }
    if (realEstate.ownersDetails && realEstate.ownersDetails.length > 0) {
      this.buyersDetails = realEstate.buyersDetails!.map((buyer: LabelValue<String>) => buyer.label).join(', ');
    }
  }
  get realEstate(): RealEstate {
    return this._realEstate;
  }

  showPopover = false;
  tagValue?: string;
  tagSeverity?: 'success' | 'info' | 'warn' | 'secondary';
  RealEstateStatus = RealEstateStatus;
  buyersDetails?: string;

  constructor(private realEstateService: RealEstateService) {
  }
}
