import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../core/models/task';
import { UtilsService } from '../core/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {

  constructor(private http: HttpClient) { }

  findAllTasks(startDate: Date, endDate: Date): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.API_URL}/api/tasks?startDate=${UtilsService.formatDateToDatabase(startDate)}&endDate=${UtilsService.formatDateToDatabase(endDate)}`);
  }
}
