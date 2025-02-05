import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CalendarEvent } from './entity/calendar-event.entity';
import { SaveCalendarEventDto } from './dto/save-calendar-event.dto';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private http: HttpClient) { }

  findAll(startDate: Date, endDate: Date): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${environment.API_URL}/api/calendar-events`);
  }

  create(createCalendarEventDto: SaveCalendarEventDto): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${environment.API_URL}/api/calendar-events`, createCalendarEventDto);
  }

  update(calendarEventId: number, updateCalendarEventDto: SaveCalendarEventDto): Observable<CalendarEvent> {
    return this.http.patch<CalendarEvent>(`${environment.API_URL}/api/calendar-events/${calendarEventId}`, updateCalendarEventDto);
  }

  remove(calendarEventId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/calendar-events/${calendarEventId}`);
  }
}
