import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RealEstateStatus } from '../model/real-estate-status.enum';
import { LabelValue } from '../../core/models/label-value.model';
import { RealEstateService } from '../real-estate.service';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Textarea } from 'primeng/textarea';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'ks-status-form',
  imports: [
    Button,
    ReactiveFormsModule,
    SelectButton,
    TranslatePipe,
    Textarea
  ],
  templateUrl: './status-form.component.html'
})
export class StatusFormComponent implements OnInit {
  form!: FormGroup;
  realEstateStatusOptions: LabelValue<RealEstateStatus>[] = [];
  @Input() realEstateId!: number;
  @Input() status!: RealEstateStatus;
  @Input() statusRemark?: string;
  @Output() statusChange = new EventEmitter<{status: RealEstateStatus; statusRemark: string; realEstateId: number;}>();

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private realEstateService: RealEstateService,
              private toasterService: ToasterService) {
  }

  ngOnInit(): void {
    this.realEstateStatusOptions = this.realEstateService.getRealEstatesStatusOptions();
    this.form = this.fb.group({
      status: [this.status],
      statusRemark: [this.statusRemark]
    });
  }

  onSubmit() {
    let rawValue = this.form.getRawValue();
    this.realEstateService.updateStatus(this.realEstateId, rawValue).subscribe((result: boolean) => {
      if (result) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
        this.statusChange.emit({realEstateId: this.realEstateId, ...rawValue});
      }
    });
  }
}
