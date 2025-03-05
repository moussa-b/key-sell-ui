import { Component, OnDestroy, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventChangeArg,
  EventClickArg,
  EventInput,
  EventSourceFuncArg
} from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { map, Observable, Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { ToasterService } from '../../core/services/toaster.service';
import { CalendarEventFormComponent } from '../calendar-event-form/calendar-event-form.component';
import { CalendarEvent } from '../entity/calendar-event.entity';
import { CalendarService } from '../calendar.service';
import { SaveCalendarEventDto } from '../dto/save-calendar-event.dto';

@Component({
  selector: 'ks-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [DialogService]
})
export class CalendarComponent implements OnInit, OnDestroy {
  constructor(private dialogService: DialogService,
              private calendarService: CalendarService,
              private toasterService: ToasterService,
              private translateService: TranslateService,) {
  }

  calendarOptions!: CalendarOptions
  private langChangeSubscription!: Subscription;

  ngOnInit(): void {
    this.calendarOptions = {
      allDaySlot: false,
      firstDay: 1,
      initialView: 'timeGridWeek',
      selectable: true,
      selectMirror: true,
      select: this.onDateSelect.bind(this),
      eventChange: (eventChangeArg: EventChangeArg): void => this.onEventChange(eventChangeArg),
      eventClick: (eventClickArg: EventClickArg): void => this.onEventClick(eventClickArg),
      events: (arg: EventSourceFuncArg, successCallback: (eventInputs: EventInput[]) => void, failureCallback: (error: Error) => void) => {
        this.getEvents(arg.start, arg.end).subscribe((eventList: EventInput[]) => successCallback(eventList));
      },
      nowIndicator: true,
      editable: true,
      locales: [frLocale],
      locale: this.translateService.currentLang,
      headerToolbar: {left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay'},
      titleFormat: {day: 'numeric', month: 'long', year: 'numeric', separator: ' – '},
      slotLabelFormat: {hour: '2-digit', minute: '2-digit', hour12: false},
      dayHeaderFormat: {weekday: 'short', day: '2-digit', month: 'short'},
      slotMinTime: '07:00:00',
      slotMaxTime: '19:00:00',
      plugins: [interactionPlugin, timeGridPlugin]
    };
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.calendarOptions.locale = event.lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  onDateSelect(dateSelectArg: DateSelectArg) {
    const calendarApi = dateSelectArg.view.calendar;
    calendarApi.unselect();
    const calendarEvent: CalendarEvent = {
      endDate: dateSelectArg.end.toISOString(),
      startDate: dateSelectArg.start.toISOString(),
      title: ''
    };
    this.dialogService.open(CalendarEventFormComponent, {
      header: this.translateService.instant('calendar.add_calendar_event'),
      data: {calendarEvent},
      closeOnEscape: false,
      closable: true,
      modal: true,
    }).onClose.subscribe((calendarEvent: CalendarEvent) => {
      if (calendarEvent) {
        calendarApi.addEvent(this.convertCalendarEventToEventInput(calendarEvent));
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      }
    });
  }

  private getEvents(startDate: Date, endDate: Date): Observable<EventInput[]> {
    return this.calendarService.findAll(startDate, endDate).pipe(map((calendarEvents: CalendarEvent[]) => {
      return calendarEvents.map((calendarEvent: CalendarEvent) => {
        return this.convertCalendarEventToEventInput(calendarEvent)
      });
    }));
  }

  private convertCalendarEventToEventInput(calendarEvent: CalendarEvent): EventInput {
    return {
      id: `calendarEvent-${calendarEvent.id}`,
      title: calendarEvent.title,
      start: calendarEvent.startDate,
      end: calendarEvent.endDate,
      extendedProps: {calendarEvent},
      className: 'cursor-pointer'
    };
  }

  private onEventClick(eventClickArg: EventClickArg) {
    const calendarEvent: CalendarEvent = eventClickArg.event.extendedProps['calendarEvent'];
    this.dialogService.open(CalendarEventFormComponent, {
      header: this.translateService.instant('calendar.edit_calendar_event'),
      data: {calendarEvent},
      closeOnEscape: false,
      closable: true,
      modal: true,
    }).onClose.subscribe((calendarEvent: CalendarEvent) => {
      if (calendarEvent) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
        eventClickArg.view.calendar.refetchEvents();
      }
    });
  }

  private onEventChange(eventChangeArg: EventChangeArg) {
    const calendarEvent: CalendarEvent = eventChangeArg.event.extendedProps['calendarEvent'];
    const startDate: Date = eventChangeArg.event.start!;
    const endDate: Date = eventChangeArg.event.end!;
    const formattedStartDate = `${String(startDate.getDate()).padStart(2, '0')}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${startDate.getFullYear()}`;
    const formattedStartHour = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const formattedEndDate = `${String(endDate.getDate()).padStart(2, '0')}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${endDate.getFullYear()}`;
    const formattedEndHour = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    const updateDto: SaveCalendarEventDto = {
      ...calendarEvent,
      startDate: formattedStartDate,
      startHour: formattedStartHour,
      endDate: formattedEndDate,
      endHour: formattedEndHour,
    }
    this.calendarService.update(calendarEvent.id!, updateDto).subscribe((updatedCalendarEvent: CalendarEvent) => {
      if (updatedCalendarEvent) {
        this.toasterService.emitValue({
          severity: 'success',
          summary: this.translateService.instant('common.success'),
          detail: this.translateService.instant('common.success_message')
        });
      } else {
        eventChangeArg.revert();
      }
    });
  }
}
