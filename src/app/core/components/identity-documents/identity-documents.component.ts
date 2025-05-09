import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Button } from 'primeng/button';
import { FileSelectEvent, FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { Message } from 'primeng/message';
import {
  RealEstatesMediaCardComponent
} from '../../../real-estates/real-estates-media-card/real-estates-media-card.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MediasService } from '../../services/medias.service';
import { AttachmentTypePipe } from '../../pipes/attachment-type.pipe';
import { Media } from '../../models/media.model';
import { ResponseStatus } from '../../models/response-status.model';
import { forkJoin } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { Badge } from 'primeng/badge';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';

type UploadedFile = { name: string, size: number, type: string; objectURL: any; uuid: string; mimeType: string; };

@Component({
  selector: 'ks-identity-documents',
  imports: [
    Button,
    FileUpload,
    Message,
    RealEstatesMediaCardComponent,
    TranslatePipe,
    AttachmentTypePipe,
    Badge,
    ConfirmPopup
  ],
  templateUrl: './identity-documents.component.html',
  styleUrl: './identity-documents.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService]
})
export class IdentityDocumentsComponent implements OnInit, AfterViewInit {
  @ViewChild('fileUpload') fileUpload?: FileUpload;
  @Output() pendingFilesChange = new EventEmitter<File[]>();
  @Output() removeMedia = new EventEmitter<string>();
  @Input() medias?: Media[];
  pendingFiles: File[] = [];
  pendingFilesTotalSize = 0;
  uploadAcceptFileType = 'image/*,application/pdf';
  fileLimit = 2;
  maxFileSize = 1000000;
  uploadedFiles: UploadedFile[] = [];

  get totalFileSize(): number {
    let totalSize = 0;
    if (this.pendingFiles.length > 0) {
      totalSize += this.pendingFiles.reduce((size: number, file: File) => size + file.size, 0);
    }
    if (this.uploadedFiles.length > 0) {
      totalSize += this.uploadedFiles.reduce((size: number, file: UploadedFile) => size + file.size, 0);
    }
    return totalSize;
  }

  constructor(private mediasService: MediasService,
              private sanitizer: DomSanitizer,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.medias && this.medias.length > 0) {
      forkJoin(this.medias.map((m: Media) => this.mediasService.getMedia(m))).subscribe({
        next: (responses: { media: Media, blob: Blob }[]) => {
          const files: File[] = [];
          responses.forEach((response: { media: Media, blob: Blob }) => {
            let file = new File([response.blob], response.media.fileName, {type: response.media.mimeType});
            (file as any).objectURL = URL.createObjectURL(response.blob);
            if (response.media.mimeType === 'application/pdf') {
              (file as any).safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(response.blob));
            }
            files.push(file);
          });
          if (files.length > 0 && this.fileUpload) {
            const event: FileUploadEvent = {
              files: files,
              originalEvent: new HttpResponse({
                body: this.medias
              })
            };
            this.fileUpload!.onUpload.emit(event);
          }
        }
      });
    }
  }

  onFileUploaded(event: FileUploadEvent) {
    if (event.files.length > 0) {
      let medias = (event.originalEvent as HttpResponse<Media[]>).body;
      if (medias) {
        medias.forEach((m: (Media | UploadedFile)) => {
          if (event.files && event.files.length > 0) {
            const file = event.files.find((f: File) => f.name === (m as Media).fileName);
            if (file) {
              this.uploadedFiles.push({
                mimeType: file.type,
                uuid: m.uuid,
                name: file.name,
                objectURL: (file as any).objectURL,
                size: file.size,
                type: file.type
              });
            }
          }
        });
        this.fileUpload!.uploadedFiles = [...event.files];
      }
    }
  }

  onClear(): void {
    this.pendingFiles = [];
    this.updatePendingFileSizeAndEmit();
  }

  onSelectFiles(event: FileSelectEvent) {
    event.currentFiles.forEach((file: File) => {
      if (file.type.startsWith('video/')) {
        (file as any).objectURL = URL.createObjectURL(file);
      }
      if (file.type.includes('pdf')) {
        (file as any).safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
      }
    });
    this.pendingFiles = event.currentFiles;
    this.updatePendingFileSizeAndEmit();
  }

  private updatePendingFileSizeAndEmit(): void {
    this.pendingFilesTotalSize = this.pendingFiles.reduce((size: number, file: File) => size + file.size, 0);
    this.pendingFilesChange.emit(this.pendingFiles);
  }

  private confirmBeforeDelete(event: MouseEvent, callBack: () => void): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translateService.instant('common.delete_identity_document_confirmation_message'),
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
      accept: callBack
    });
  }

  onRemovePendingFile(file: File, event: MouseEvent, removeFileCallback: (event: Event, index: number) => void, index: number) {
    this.confirmBeforeDelete(event, () => {
      removeFileCallback(event, index);
      this.pendingFiles = this.pendingFiles.filter((f: File) => f.name !== file.name);
      this.updatePendingFileSizeAndEmit();
    });
  }

  onRemoveUploadedFile(file: File, removeFileCallback: (index: number) => void, index: number, clearCallback: VoidFunction, event: MouseEvent) {
    const mediaIndex = this.uploadedFiles.findIndex((u: UploadedFile) => u.name === file.name);
    if (mediaIndex >= 0) {
      this.confirmBeforeDelete(event, () => {
        this.mediasService.removeMedia(this.uploadedFiles[mediaIndex].uuid).subscribe((res: ResponseStatus) => {
          if (res.status) {
            this.removeMedia.emit(this.uploadedFiles[mediaIndex].uuid);
            this.uploadedFiles.splice(mediaIndex, 1);
            removeFileCallback(index);
            if (this.uploadedFiles.length === 0) {
              clearCallback();
            }
          }
        });
      });
    }
  }
}
