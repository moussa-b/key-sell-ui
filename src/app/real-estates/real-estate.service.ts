import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RealEstate } from './model/real-estate';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LabelValue } from '../core/models/label-value.model';
import { SaveRealEstateDto } from './dto/save-real-estate.dto';
import { RealEstateType } from './model/real-estate-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { ResponseStatus } from '../core/models/response-status.model';
import { RealEstateStatus } from './model/real-estate-status.enum';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RealEstateOrientation } from './model/real-estate-orientation.enum';
import { RealEstateAssignment } from './model/real-estate-assignment.enum';
import { Task, TaskStatus } from '../core/models/task';
import { SaveTaskDto } from './dto/save-task.dto';

@Injectable({
  providedIn: 'root'
})
export class RealEstateService {
  constructor(private http: HttpClient, private translateService: TranslateService) {
  }

  findAll(): Observable<RealEstate[]> {
    return this.http.get<RealEstate[]>(`${environment.API_URL}/api/real-estates`);
  }

  findOne(realEstateId: number): Observable<RealEstate> {
    return this.http.get<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}`);
  }

  create(saveRealEstateDto: SaveRealEstateDto): Observable<RealEstate> {
    return this.http.post<RealEstate>(`${environment.API_URL}/api/real-estates`, saveRealEstateDto);
  }

  update(realEstateId: number, saveRealEstateDto: SaveRealEstateDto): Observable<RealEstate> {
    return this.http.patch<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}`, saveRealEstateDto);
  }

  updateStatus(realEstateId: number, statusDto: UpdateStatusDto): Observable<RealEstate> {
    return this.http.patch<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}/status`, statusDto);
  }

  findAllOwners(): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/owners`);
  }

  findAllBuyers(): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/buyers`);
  }

  remove(realEstateId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/real-estates/${realEstateId}`);
  }

  removePictures(realEstateId: number, pictureUuid: string): Observable<ResponseStatus> {
    return this.http.delete<ResponseStatus>(`${environment.API_URL}/api/real-estates/${realEstateId}/pictures/${pictureUuid}`);
  }

  findAllTasksByRealEstateId(realEstateId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.API_URL}/api/real-estates/${realEstateId}/tasks`);
  }

  createTask(realEstateId: number, saveTaskDto: SaveTaskDto): Observable<Task> {
    return this.http.post<Task>(`${environment.API_URL}/api/real-estates/${realEstateId}/tasks`, saveTaskDto);
  }

  updateTask(realEstateId: number, taskId: number, saveTaskDto: SaveTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${environment.API_URL}/api/real-estates/${realEstateId}/tasks/${taskId}`, saveTaskDto);
  }

  updateTaskStatus(realEstateId: number, taskId: RealEstate, status: TaskStatus): Observable<ResponseStatus> {
    return this.http.patch<ResponseStatus>(`${environment.API_URL}/api/real-estates/${realEstateId}/tasks/${taskId}/status`, {status: status});
  }

  removeTask(realEstateId: number, taskId: number): Observable<ResponseStatus> {
    return this.http.delete<ResponseStatus>(`${environment.API_URL}/api/real-estates/${realEstateId}/tasks/${taskId}`);
  }

  findAllUsers(realEstateId: number): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/${realEstateId}/users`);
  }

  findAllTaskType(realEstateId: number): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/${realEstateId}/tasks/types`);
  }

  export(realEstateId: number): void {
    this.http.get(`${environment.API_URL}/api/real-estates/${realEstateId}/export`, {observe: 'response', responseType: 'arraybuffer'}).subscribe(
      {
        next: (response: HttpResponse<ArrayBuffer>) => {
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `export_real_estate_${realEstateId}.pdf`;
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match && match.length > 1) {
              filename = match[1];
            }
          }
          const blob = new Blob([response.body!], {type: 'application/pdf'});
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => console.error('Error downloading PDF:', error)
      }
    );
  }

  getRealEstatesTypes(): LabelValue<RealEstateType>[] {
    return [
      {label: this.translateService.instant('real_estates.house'), value: RealEstateType.HOUSE},
      {label: this.translateService.instant('real_estates.villa'), value: RealEstateType.VILLA},
      {label: this.translateService.instant('real_estates.apartment'), value: RealEstateType.APARTMENT},
      {label: this.translateService.instant('real_estates.land'), value: RealEstateType.LAND},
      {label: this.translateService.instant('common.other'), value: RealEstateType.NONE}
    ]
  }

  getRealEstateOrientations(): LabelValue<RealEstateOrientation>[] {
    return [
      {label: this.translateService.instant('real_estates.north'), value: RealEstateOrientation.NORTH},
      {label: this.translateService.instant('real_estates.northeast'), value: RealEstateOrientation.NORTH_EAST},
      {label: this.translateService.instant('real_estates.east'), value: RealEstateOrientation.EAST},
      {label: this.translateService.instant('real_estates.southeast'), value: RealEstateOrientation.SOUTH_EAST},
      {label: this.translateService.instant('real_estates.south'), value: RealEstateOrientation.SOUTH},
      {label: this.translateService.instant('real_estates.southwest'), value: RealEstateOrientation.SOUTH_WEST},
      {label: this.translateService.instant('real_estates.west'), value: RealEstateOrientation.WEST},
      {label: this.translateService.instant('real_estates.northwest'), value: RealEstateOrientation.NORTH_WEST},
    ]
  }

  getRealEstateAssignments(): LabelValue<RealEstateAssignment>[] {
    return [
      {label: this.translateService.instant('real_estates.house'), value: RealEstateAssignment.HOUSE},
      {label: this.translateService.instant('real_estates.villa'), value: RealEstateAssignment.VILLA},
      {label: this.translateService.instant('real_estates.apartment'), value: RealEstateAssignment.APARTMENT},
      {label: this.translateService.instant('real_estates.commercial_space'), value: RealEstateAssignment.COMMERCIAL_SPACE},
      {label: this.translateService.instant('real_estates.offices'), value: RealEstateAssignment.OFFICE},
      {label: this.translateService.instant('real_estates.agriculture'), value: RealEstateAssignment.AGRICULTURE},
      {label: this.translateService.instant('common.other'), value: RealEstateAssignment.NONE},
    ]
  }

  getRealEstatesStatusOptions(includeOther = false): LabelValue<RealEstateStatus>[] {
    return [
      {label: this.translateService.instant('real_estates.for_sale'), value: RealEstateStatus.FOR_SALE},
      {label: this.translateService.instant('real_estates.sale_in_progress'), value: RealEstateStatus.SALE_IN_PROGRESS},
      {label: this.translateService.instant('real_estates.sold'), value: RealEstateStatus.SOLD},
      ...(includeOther ? [{label: this.translateService.instant('common.other'), value: RealEstateStatus.NONE}] : [])
    ]
  }

  getRealEstateFormatedType(type: RealEstateType): string {
    switch (type) {
      case RealEstateType.APARTMENT:
        return this.translateService.instant('real_estates.apartment');
      case RealEstateType.VILLA:
        return this.translateService.instant('real_estates.villa');
      case RealEstateType.HOUSE:
        return this.translateService.instant('real_estates.house');
      case RealEstateType.LAND:
        return this.translateService.instant('real_estates.land');
    }
    return this.translateService.instant('common.other');
  }

  getRealEstateFormatedAssignment(type: RealEstateAssignment): string {
    switch (type) {
      case RealEstateAssignment.HOUSE:
        return this.translateService.instant('real_estates.house');
      case RealEstateAssignment.VILLA:
        return this.translateService.instant('real_estates.villa');
      case RealEstateAssignment.APARTMENT:
        return this.translateService.instant('real_estates.apartment');
      case RealEstateAssignment.COMMERCIAL_SPACE:
        return this.translateService.instant('real_estates.commercial_space');
      case RealEstateAssignment.OFFICE:
        return this.translateService.instant('real_estates.offices');
      case RealEstateAssignment.AGRICULTURE:
        return this.translateService.instant('real_estates.agriculture');
    }
    return this.translateService.instant('common.other');
  }

  getRealEstateFormatedOrientation(type: RealEstateOrientation): string {
    switch (type) {
      case RealEstateOrientation.NORTH:
        return this.translateService.instant('real_estates.north');
      case RealEstateOrientation.NORTH_EAST:
        return this.translateService.instant('real_estates.northeast');
      case RealEstateOrientation.EAST:
        return this.translateService.instant('real_estates.east');
      case RealEstateOrientation.SOUTH_EAST:
        return this.translateService.instant('real_estates.southeast');
      case RealEstateOrientation.SOUTH:
        return this.translateService.instant('real_estates.south');
      case RealEstateOrientation.SOUTH_WEST:
        return this.translateService.instant('real_estates.southwest');
      case RealEstateOrientation.WEST:
        return this.translateService.instant('real_estates.west');
      case RealEstateOrientation.NORTH_WEST:
        return this.translateService.instant('real_estates.northwest');
    }
    return this.translateService.instant('common.other');
  }

  getRealEstateFormattedStatus(status: RealEstateStatus) {
    switch (status) {
      case RealEstateStatus.FOR_SALE:
        return this.translateService.instant('real_estates.for_sale');
      case RealEstateStatus.SALE_IN_PROGRESS:
        return this.translateService.instant('real_estates.sale_in_progress');
      case RealEstateStatus.SOLD:
        return this.translateService.instant('real_estates.sold');
    }
    return this.translateService.instant('common.other');
  }

  getTaskFormattedStatus(status: TaskStatus) {
    switch (status) {
      case TaskStatus.TO_DO:
        return this.translateService.instant('tasks.to_do');
      case TaskStatus.IN_PROGRESS:
        return this.translateService.instant('tasks.in_progress');
      case TaskStatus.DONE:
        return this.translateService.instant('tasks.done');
    }
    return this.translateService.instant('common.other');
  }

  getTaskStatusOptions(): LabelValue<TaskStatus>[] {
    return [
      {label: this.translateService.instant('tasks.to_do'), value: TaskStatus.TO_DO},
      {label: this.translateService.instant('tasks.in_progress'), value: TaskStatus.IN_PROGRESS},
      {label: this.translateService.instant('tasks.done'), value: TaskStatus.DONE}
    ]
  }
}
