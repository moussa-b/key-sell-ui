import { Component, Input } from '@angular/core';
import { RealEstateStatus } from '../model/real-estate-status.enum';
import { RealEstateService } from '../real-estate.service';
import { Tag } from 'primeng/tag';
import { Popover } from 'primeng/popover';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ks-status-tag',
  imports: [
    Tag,
    Popover,
    NgClass
  ],
  templateUrl: './status-tag.component.html'
})
export class StatusTagComponent {
  @Input() set status(status: RealEstateStatus) {
    this.value = this.realEstateService.getRealEstateFormatedStatus(status);
    switch (status) {
      case RealEstateStatus.FOR_SALE:
        this.severity = 'info';
        break;
      case RealEstateStatus.SALE_IN_PROGRESS:
        this.severity = 'warn';
        break;
      case RealEstateStatus.SOLD:
        this.severity = 'success';
        break;
      default:
        this.severity = 'secondary';
        break;
    }
  }
  @Input() statusRemark?: string;

  value?: string;
  severity?: 'success' | 'info' | 'warn' | 'secondary';

  constructor(private realEstateService: RealEstateService) {
  }
}
