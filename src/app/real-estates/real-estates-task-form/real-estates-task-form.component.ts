import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SaveTaskDto } from '../dto/save-task.dto';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../model/task';
import { RealEstateService } from '../real-estate.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToasterService } from '../../core/services/toaster.service';
import { LabelValue } from '../../core/models/label-value.model';
import { RealEstate } from '../model/real-estate';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { UtilsService } from '../../core/services/utils.service';
import { SelectButton } from 'primeng/selectbutton';

@Component({
  selector: 'ks-real-estates-task-form',
  imports: [
    Button,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    Select,
    Textarea,
    InputNumber,
    MultiSelect,
    InputText,
    DatePicker,
    TableModule,
    SelectButton
  ],
  templateUrl: './real-estates-task-form.component.html',
  styleUrl: './real-estates-task-form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RealEstatesTaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  taskTypes: LabelValue<number>[] = [];
  realEstate!: RealEstate;
  users?: LabelValue<number>[];
  taskStatusOptions: LabelValue<TaskStatus>[] = [];

  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private toasterService: ToasterService,
              private realEstateService: RealEstateService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig) {
  }

  ngOnInit(): void {
    const task: Task | undefined = this.dialogConfig.data.task;
    this.realEstate = this.dialogConfig.data.realEstate;
    this.taskTypes = this.dialogConfig.data.taskTypes;
    this.taskStatusOptions = this.realEstateService.getTaskStatusOptions();
    this.findAllUsers();
    this.taskForm = this.fb.group({
      id: [task?.id],
      title: [task?.title, Validators.required],
      type: [task?.type],
      status: [task ? task.status : TaskStatus.TO_DO, Validators.required],
      users: [task?.users, Validators.required],
      date: [task?.date ? UtilsService.formatIsoDateToDisplay(task.date) : undefined, Validators.required],
      description: [task?.description],
      duration: [task?.duration, [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit(): void {
    let saveTaskDto: SaveTaskDto = this.taskForm.getRawValue();
    saveTaskDto = {
      ...saveTaskDto,
      date: this.convertDateToDatabase(saveTaskDto.date)
    };
    let taskObservable: Observable<Task>;
    if (saveTaskDto.id && saveTaskDto.id > 0) {
      taskObservable = this.realEstateService.updateTask(this.realEstate.id, saveTaskDto.id, saveTaskDto);
    } else {
      taskObservable = this.realEstateService.createTask(this.realEstate.id, saveTaskDto);
    }
    taskObservable.subscribe((task: Task) => {
      if (task && task.id > 0) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
        this.dialogRef.close(task);
      }
    });
  }

  private convertDateToDatabase(dateStr: string) {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
  }

  private findAllUsers() {
    this.realEstateService.findAllUsers(this.realEstate.id).subscribe((users: LabelValue<number>[]) => {
      this.users = users || [];
    });
  }
}
