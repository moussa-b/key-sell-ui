import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Highlight,
  Italic,
  Link,
  List,
  Paragraph
} from 'ckeditor5';
import coreTranslations from 'ckeditor5/translations/fr.js';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'ks-send-email',
  imports: [ReactiveFormsModule, CKEditorModule, TranslatePipe, Button, InputText,],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SendEmailComponent {
  sendEmailForm!: FormGroup;
  public Editor = ClassicEditor;
  config: any;
  constructor(private fb: FormBuilder,
              private translateService: TranslateService,
              private dialogRef: DynamicDialogRef) {}

  ngOnInit() {
    this.sendEmailForm = this.fb.group({
      subject: [undefined, Validators.required],
      messageHtml: [undefined, Validators.required]
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
    if (this.sendEmailForm.valid) {
      this.dialogRef.close(this.sendEmailForm.getRawValue());
    }
  }
}
