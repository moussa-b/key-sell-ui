import { Component, OnDestroy, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput, EventMountArg, EventSourceFuncArg } from '@fullcalendar/core';
import { map, Observable, Subscription } from 'rxjs';
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PlanningService } from '../planning.service';
import { Task } from '../../core/models/task';
import { UtilsService } from '../../core/services/utils.service';
import { LabelValue } from '../../core/models/label-value.model';

@Component({
  selector: 'ks-planning',
  imports: [
    FullCalendarModule
  ],
  templateUrl: './planning.component.html'
})
export class PlanningComponent implements OnInit, OnDestroy {
  calendarOptions!: CalendarOptions
  private langChangeSubscription!: Subscription;

  constructor(private planningService: PlanningService,
              private translateService: TranslateService,) {
  }

  ngOnInit(): void {
    this.calendarOptions = {
      allDaySlot: false,
      firstDay: 1,
      initialView: 'timeGridWeek',
      selectable: true,
      selectMirror: true,
      eventClick: (eventClickArg: EventClickArg): void => this.onEventClick(eventClickArg),
      eventDidMount: (eventMountArg: EventMountArg) => this.onEventDidMount(eventMountArg),
      events: (arg: EventSourceFuncArg, successCallback: (eventInputs: EventInput[]) => void, failureCallback: (error: Error) => void) => {
        this.getEvents(arg.start, arg.end).subscribe((eventList: EventInput[]) => successCallback(eventList));
      },
      nowIndicator: true,
      editable: true,
      locales: [frLocale],
      locale: this.translateService.currentLang,
      headerToolbar: {left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay,listWeek'},
      titleFormat: {day: 'numeric', month: 'long', year: 'numeric', separator: ' – '},
      slotLabelFormat: {hour: '2-digit', minute: '2-digit', hour12: false},
      dayHeaderFormat: {weekday: 'short', day: '2-digit', month: 'short'},
      slotMinTime: '07:00:00',
      slotMaxTime: '19:00:00',
      plugins: [interactionPlugin, timeGridPlugin, listPlugin]
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

  private getEvents(startDate: Date, endDate: Date): Observable<EventInput[]> {
    return this.planningService.findAllTasks(startDate, endDate).pipe(map((tasks: Task[]) => {
      return tasks.map((task: Task) => {
        return this.convertTaskToEventInput(task)
      });
    }));
  }

  private convertTaskToEventInput(task: Task): EventInput {
    let start = UtilsService.createDateTime(task.date, task.hour);
    return {
      id: `task-${task.id}`,
      title: task.title,
      start: start,
      end: UtilsService.addHoursToDate(start, task.duration),
      extendedProps: {task},
      className: 'cursor-pointer'
    };
  }

  private onEventClick(eventClickArg: EventClickArg) {
    const task: Task = eventClickArg.event.extendedProps['task'];
  }

  private onEventDidMount(eventMountArg: EventMountArg) {
    const task: Task = eventMountArg.event.extendedProps['task'];
    if (task && task.usersDetails && task.usersDetails.length > 0) {
      const container = eventMountArg.el.querySelector('.fc-event-title-container');
      if (container) {
        const span = document.createElement('span');
        span.style.fontStyle = 'italic';
        span.innerHTML = `<u>${this.translateService.instant('tasks.responsible')} :</u> ${task.usersDetails.map((userDetail: LabelValue<number>) => userDetail.label).join(', ')}`;
        container.append(span);
      }
    }
  }
}
