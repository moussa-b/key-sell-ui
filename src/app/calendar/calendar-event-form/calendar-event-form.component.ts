import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { Bold, ClassicEditor, Essentials, Italic, Paragraph, Link, Heading, BlockQuote, Highlight, List } from 'ckeditor5';
import coreTranslations from 'ckeditor5/translations/fr.js';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CalendarService } from '../calendar.service';
import { CalendarEvent } from '../entity/calendar-event.entity';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';

@Component({
  selector: 'ks-calendar-event-form',
  imports: [ReactiveFormsModule, CKEditorModule, DatePicker, TranslatePipe, Button,],
  templateUrl: './calendar-event-form.component.html',
  styleUrl: './calendar-event-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalendarEventFormComponent {
  eventForm!: FormGroup;
  public Editor = ClassicEditor;
  config: any;
  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private calendarService: CalendarService,
              private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig) {}

  ngOnInit() {
    const calendarEvent: CalendarEvent = this.dialogConfig.data.calendarEvent;
    const startDate = new Date(calendarEvent.startDate);
    const endDate = new Date(calendarEvent.endDate);
    const formattedStartDate = `${String(startDate.getDate()).padStart(2, '0')}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${startDate.getFullYear()}`;
    const formattedStartHour = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const formattedEndDate = `${String(endDate.getDate()).padStart(2, '0')}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${endDate.getFullYear()}`;
    const formattedEndHour = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    this.eventForm = this.fb.group({
      id: [calendarEvent.id],
      title: [calendarEvent.title, Validators.required],
      description: [calendarEvent.description],
      startDate: [formattedStartDate, Validators.required],
      startHour: [formattedStartHour, Validators.required],
      endDate: [formattedEndDate, Validators.required],
      endHour: [formattedEndHour, Validators.required]
    });
    this.config = {
      plugins: [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Link,
        List,
        Heading,
        BlockQuote,
        Highlight,
      ],
      toolbar: {
        shouldNotGroupWhenFull: true,
        items: [
          'undo', 'redo', '|',
          'heading', '|',
          'bold', 'italic', '|',
          'link', 'highlight', 'blockQuote', '|',
          'bulletedList', 'numberedList',
        ]
      },
      licenseKey: 'GPL',
      translations: [ coreTranslations ],
      language: {ui: this.translateService.currentLang}
    };
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const eventFormValue = this.eventForm.getRawValue();
      const observable = eventFormValue.id > 0 ? this.calendarService.update(eventFormValue.id, eventFormValue) : this.calendarService.create(eventFormValue);
      observable.subscribe((calendarEvent: CalendarEvent) => {
        if (calendarEvent && calendarEvent.id! > 0) {
          this.dialogRef.close(calendarEvent);
        }
      });
    }
  }
}
