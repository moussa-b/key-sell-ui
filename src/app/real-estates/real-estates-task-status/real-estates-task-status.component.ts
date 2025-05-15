import { Component, Input } from '@angular/core';
import { RealEstateService } from '../real-estate.service';
import { TaskStatus } from '../../core/models/task';
import { Tag } from 'primeng/tag';
import { NgClass } from '@angular/common';
import { Popover } from 'primeng/popover';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { LabelValue } from '../../core/models/label-value.model';
import { PermissionService } from '../../core/services/permission.service';
import { Button } from 'primeng/button';
import { RealEstate } from '../model/real-estate';
import { ResponseStatus } from '../../core/models/response-status.model';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'ks-real-estates-task-status',
  imports: [
    Tag,
    NgClass,
    Popover,
    TranslatePipe,
    ReactiveFormsModule,
    SelectButton,
    FormsModule,
    Button
  ],
  templateUrl: './real-estates-task-status.component.html',
  styleUrl: './real-estates-task-status.component.scss'
})
export class RealEstatesTaskStatusComponent {
  taskStatusOptions: LabelValue<TaskStatus>[] = [];
  tagValue?: string;
  tagSeverity?: 'success' | 'info' | 'warn' | 'secondary';
  taskStatusModel!: TaskStatus;
  showPopover = false;
  @Input({required: true}) realEstate!: RealEstate;
  @Input({required: true}) taskId!: RealEstate;
  @Input({required: true}) set taskStatus(taskStatus: TaskStatus) {
    this.taskStatusModel = taskStatus;
    this.tagValue = this.realEstateService.getTaskFormattedStatus(taskStatus);
    switch (taskStatus) {
      case TaskStatus.TO_DO:
        this.tagSeverity = 'info';
        break;
      case TaskStatus.IN_PROGRESS:
        this.tagSeverity = 'warn';
        break;
      case TaskStatus.DONE:
        this.tagSeverity = 'success';
        break;
      default:
        this.tagSeverity = 'secondary';
        break;
    }
  }

  constructor(private realEstateService: RealEstateService,
              private toasterService: ToasterService,
              private translateService: TranslateService,
              private permissionService: PermissionService) {
    const userAccess = this.permissionService.getUserAccess();
    this.showPopover = userAccess.canEditTasks;
    this.taskStatusOptions = this.realEstateService.getTaskStatusOptions();
  }

  updateStatus(): void {
    this.realEstateService.updateTaskStatus(this.realEstate.id, this.taskId, this.taskStatusModel)
      .subscribe((responseStatus: ResponseStatus) => {
        if (responseStatus.status) {
          this.taskStatus = this.taskStatusModel;
          this.toasterService.emitValue({
            severity: 'success',
            summary: this.translateService.instant('common.success'),
            detail: this.translateService.instant('common.success_message')
          });
        }
      });
  }
}
