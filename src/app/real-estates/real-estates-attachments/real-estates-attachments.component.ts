import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FileSelectEvent, FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Badge } from 'primeng/badge';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Media } from '../../core/models/media.model';
import { HttpResponse } from '@angular/common/http';
import { RealEstateService } from '../real-estate.service';
import { ToasterService } from '../../core/services/toaster.service';
import { PrimeNG } from 'primeng/config';
import { MediasService } from '../../core/services/medias.service';
import { ResponseStatus } from '../../core/models/response-status.model';
import { forkJoin } from 'rxjs';
import { PrimeIcons } from 'primeng/api';

type UploadedFile = { name: string, size: number, type: string; objectURL: any; uuid: string; mimeType: string; };

@Component({
  selector: 'app-real-estates-attachments',
  imports: [
    FileUpload,
    Button,
    Message,
    Badge,
    TranslatePipe
  ],
  templateUrl: './real-estates-attachments.component.html',
  styleUrl: './real-estates-attachments.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RealEstatesAttachmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileUpload') fileUpload?: FileUpload;
  @Input({required: true}) realEstateId!: number;
  @Input({required: true}) medias: Media[] = [];
  @Input({required: true}) attachmentType!: 'pictures' | 'documents' | 'videos';
  @Input() hasPendingFiles: boolean = false;
  @Output() hasPendingFilesChange = new EventEmitter<boolean>();
  pendingFiles: File[] = [];
  filesTotalSize = 0;
  private uploadedFiles: UploadedFile[] = [];
  private fileUploadInit = false;
  fileLimit!: number;
  maxFileSize!: number;
  uploadParameterName!: string;
  uploadAcceptFileType!: string;
  PrimeIcons: typeof PrimeIcons = PrimeIcons;

  get uploadUrl(): string {
    return `${environment.API_URL}/api/real-estates/${this.realEstateId}/${this.attachmentType}/upload`;
  }

  constructor(private realEstateService: RealEstateService,
              private toasterService: ToasterService,
              private translateService: TranslateService,
              private config: PrimeNG,
              private mediasService: MediasService
  ) {
  }

  ngOnInit(): void {
    this.uploadParameterName = this.attachmentType + '[]';
    switch(this.attachmentType) {
      case 'pictures':
        this.fileLimit = 10;
        this.maxFileSize = 2000000;
        this.uploadAcceptFileType = 'image/*';
        break;
      case 'documents':
        this.fileLimit = 5;
        this.maxFileSize = 1000000;
        this.uploadAcceptFileType = '.pdf';
        break;
      case 'videos':
        this.fileLimit = 1;
        this.maxFileSize = 20000000;
        this.uploadAcceptFileType = 'video/*';
        break;
      default:
        this.fileLimit = 5;
        this.maxFileSize = 1000000;
        break;
    }
  }

  ngAfterViewInit(): void {
    if (this.medias.length > 0) {
      forkJoin(this.medias.map((m: Media) => this.mediasService.getMedia(m, this.attachmentType))).subscribe({
        next: (responses: { media: Media, blob: Blob }[]) => {
          const files: File[] = [];
          responses.forEach((response: { media: Media, blob: Blob }) => {
            let file = new File([response.blob], response.media.fileName, {type: response.media.mimeType});
            (file as any).objectURL = URL.createObjectURL(response.blob);
            files.push(file);
          });
          if (files.length > 0 && this.fileUpload) {
            const event: FileUploadEvent = {
              files: files,
              originalEvent: new HttpResponse({
                body: this.medias
              })
            };
            this.fileUploadInit = true;
            this.fileUpload!.onUpload.emit(event);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.uploadedFiles?.forEach((u: UploadedFile) => URL.revokeObjectURL(u.objectURL));
  }

  onSelectFiles(event: FileSelectEvent) {
    this.pendingFiles = event.currentFiles;
    this.pendingFiles.forEach((file: File) => {
      this.filesTotalSize += file.size;
    });
    this.hasPendingFilesChange.emit(this.pendingFiles.length > 0);
  }

  onFileUploaded(event: FileUploadEvent) {
    console.log('--> event : ', event);
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
        if (!this.fileUploadInit) {
          this.toasterService.emitValue({
            severity: 'success',
            summary: this.translateService.instant('common.success'),
            detail: this.translateService.instant('common.success_message')
          });
          this.hasPendingFilesChange.emit(false);
        } else {
          this.fileUploadInit = false;
          this.fileUpload!.uploadedFiles = [...event.files];
        }
      }
    }
  }

  onClear(): void {
    this.filesTotalSize = 0;
    this.pendingFiles = [];
    this.hasPendingFilesChange.emit(this.pendingFiles.length > 0);
  }

  onRemovePendingFile(file: File) {
    this.pendingFiles = this.pendingFiles.filter((f: File) => f.name !== file.name);
    this.hasPendingFilesChange.emit(this.pendingFiles.length > 0);
    this.filesTotalSize -= file.size;
  }

  onRemoveUploadedFile(file: File, removeFileCallback: (index: number) => void, index: number, clearCallback: VoidFunction) {
    const mediaIndex = this.uploadedFiles.findIndex((u: UploadedFile) => u.name === file.name);
    if (mediaIndex >= 0) {
      this.realEstateService.removePictures(this.realEstateId, this.uploadedFiles[mediaIndex].uuid).subscribe((res: ResponseStatus) => {
        if (res.status) {
          this.uploadedFiles.splice(mediaIndex, 1);
          removeFileCallback(index);
          if (this.uploadedFiles.length === 0) {
            clearCallback();
          }
          this.filesTotalSize -= file.size;
        }
      });
    }
  }

  formatSize(bytes: number) {
    const k = 1024;
    const dm = 2;
    const sizes = this.config.translation.fileSizeTypes!;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }
}
