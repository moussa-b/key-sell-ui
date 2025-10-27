import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Button } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { LabelValue } from '../../core/models/label-value.model';
import { InputText } from 'primeng/inputtext';
import { Task, TaskStatus } from '../../core/models/task';
import { UserAccess } from '../../core/models/user-access.model';
import { PermissionService } from '../../core/services/permission.service';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { RealEstate } from '../model/real-estate';
import { RealEstateService } from '../real-estate.service';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import {
  ConfirmationService,
  FilterMatchMode,
  FilterService,
  MenuItem,
  MenuItemCommandEvent,
  PrimeIcons
} from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { RealEstatesTaskFormComponent } from '../real-estates-task-form/real-estates-task-form.component';
import { forkJoin } from 'rxjs';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ToasterService } from '../../core/services/toaster.service';
import { UtilsService } from '../../core/services/utils.service';
import { Menu } from 'primeng/menu';
import { RealEstatesTaskStatusComponent } from '../real-estates-task-status/real-estates-task-status.component';
import { ResponseStatus } from '../../core/models/response-status.model';

type uiFields = {formattedType?: string; formattedDate?: string; concatenedUsers?: string; formattedStatus?: string;};

@Component({
  selector: 'ks-real-estates-task-list',
  imports: [
    Button,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    MultiSelect,
    InputText,
    DatePipe,
    TableModule,
    IconField,
    InputIcon,
    ConfirmPopup,
    Menu,
    RealEstatesTaskStatusComponent
  ],
  templateUrl: './real-estates-task-list.component.html',
  styleUrl: './real-estates-task-list.component.scss',
  providers: [ConfirmationService, DialogService],
  encapsulation: ViewEncapsulation.None
})
export class RealEstatesTaskListComponent implements OnInit {
  @ViewChild('dt') dt: any;
  readonly FilterMatchMode = FilterMatchMode;
  taskTypes: LabelValue<number>[] = [];
  taskTypesForFilter: LabelValue<number>[] = [];
  usersForFilter: LabelValue<number>[] = [];
  taskStatusForFilter: LabelValue<TaskStatus>[] = [];
  tasks?: (Task & uiFields)[];
  userAccess!: UserAccess;
  realEstate!: RealEstate;
  items!: MenuItem[];
  selectedTask?: Task;

  constructor(private confirmationService: ConfirmationService,
              private elementRef: ElementRef,
              private permissionService: PermissionService,
              private realEstateService: RealEstateService,
              private translateService: TranslateService,
              private filterService: FilterService,
              private toasterService: ToasterService,
              private dialogService: DialogService,
              private dialogConfig: DynamicDialogConfig) {
  }

  ngOnInit(): void {
    this.realEstate = this.dialogConfig.data.realEstate;
    this.userAccess = this.permissionService.getUserAccess();
    this.taskStatusForFilter = this.realEstateService.getTaskStatusOptions();
    this.filterService.register('multiSelectMatchMode', UtilsService.matchesFilter);
    this.filterService.register('multiSelectLabelValueMatchMode', UtilsService.matchesLabelValueFilter);
    this.initializeMenu();
    forkJoin(
      {
        taskTypes: this.realEstateService.findAllTaskType(this.realEstate.id),
        tasks: this.realEstateService.findAllTasksByRealEstateId(this.realEstate.id),
      })
      .subscribe((res: { taskTypes: LabelValue<number>[], tasks: Task[] }) => {
        this.taskTypes = res.taskTypes;
        this.processTasks(res.tasks);
      });
  }

  private initializeMenu() {
    this.items = [
      {
        label: this.translateService.instant('common.edit'),
        icon: PrimeIcons.PEN_TO_SQUARE,
        command: () => this.editTask(),
        visible: this.userAccess.canEditTasks
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: PrimeIcons.TRASH,
        command: (menuEvent: MenuItemCommandEvent) => this.deleteTask(menuEvent.originalEvent!),
        visible: this.userAccess.canEditTasks
      },
    ].filter((m: MenuItem) => m.visible !== false);
  }

  addTask() {
    this.dialogService.open(RealEstatesTaskFormComponent, {
      header: this.translateService.instant('tasks.add_task'),
      data: {
        realEstate: this.realEstate,
        taskTypes: this.taskTypes,
      },
      closeOnEscape: false,
      closable: true,
      modal: true,
    })?.onClose.subscribe((task?: Task) => {
      if (task) {
        this.findAllTasks();
      }
    });
  }

  getTypeLabel(type: number) {
    return this.taskTypes.find(t => t.value === type)?.label;
  }

  private findAllTasks() {
    this.realEstateService.findAllTasksByRealEstateId(this.realEstate.id).subscribe((tasks: Task[]) => {
      this.processTasks(tasks);
    });
  }

  private processTasks(tasks: Task[]) {
    this.tasks = (tasks || []).map((task: Task) => {
      return this.formatTaskForTable(task);
    });
    if (this.usersForFilter.length > 0) {
      this.usersForFilter.sort((owner1: LabelValue<number>, owner2: LabelValue<number>) => owner1.label.localeCompare(owner2.label));
    }
    if (this.usersForFilter.length > 0) {
      this.taskTypesForFilter.sort((type1: LabelValue<number>, type2: LabelValue<number>) => type1.value - type2.value);
    }
  }

  private formatTaskForTable(task: Task) {
    let concatenedUsers = '';
    if (task.usersDetails && task.usersDetails.length > 0) {
      concatenedUsers = task.usersDetails!.map((user: LabelValue<number>) => user.label).join(', ');
      task.usersDetails.forEach((user: LabelValue<number>) => {
        if (!this.usersForFilter.some((item: LabelValue<number>) => item.value === user.value)) {
          this.usersForFilter.push(user);
        }
      });
      if (!this.taskTypesForFilter.some((item: LabelValue<number>) => item.value === task.type)) {
        this.taskTypesForFilter.push(this.taskTypes.find((item: LabelValue<number>) => item.value === task.type)!);
      }
    }
    return {
      ...task,
      concatenedUsers: concatenedUsers,
      formattedDate: UtilsService.formatIsoDateToDisplay(task.date),
      formattedType: this.getTypeLabel(task.type),
      formattedStatus: this.realEstateService.getTaskFormattedStatus(task.status),
    }
  }

  private editTask() {
    this.dialogService.open(RealEstatesTaskFormComponent, {
      header: this.translateService.instant('tasks.edit_task'),
      data: {
        realEstate: this.realEstate,
        taskTypes: this.taskTypes,
        task: this.selectedTask
      },
      closeOnEscape: false,
      closable: true,
      modal: true,
    })?.onClose.subscribe((task: Task) => {
      this.selectedTask = undefined;
      if (task) {
        this.findAllTasks();
      }
    });
  }

  private deleteTask(event: Event) {
    const taskId = this.selectedTask!.id!;
    this.selectedTask = undefined;
    const button = this.elementRef.nativeElement.querySelector(`tr[data-task-id='${taskId}'] button`);
    this.confirmationService.confirm({
      target: button || event?.target as EventTarget,
      message: this.translateService.instant('tasks.delete_task_confirmation_message'),
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
        this.realEstateService.removeTask(this.realEstate.id, taskId).subscribe((result: ResponseStatus) => {
          if (result.status) {
            this.toasterService.emitValue({
              severity: 'success',
              summary: this.translateService.instant('common.success'),
              detail: this.translateService.instant('common.success_message')
            });
            this.tasks = this.tasks!.filter((t: Task & uiFields) => t.id !== taskId);
          }
        });
      }
    });
  }
}
