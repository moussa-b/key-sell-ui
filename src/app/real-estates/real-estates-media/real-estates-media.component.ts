import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { Media } from '../../core/models/media.model';
import { MediasService } from '../../core/services/medias.service';
import { Image } from 'primeng/image';
import { DomSanitizer } from '@angular/platform-browser';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'ks-real-estates-media',
  templateUrl: './real-estates-media.component.html',
  imports: [
    Image,
    Dialog
  ],
  styleUrl: './real-estates-media.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RealEstatesMediaComponent implements OnInit, OnDestroy {
  @Input() file?: { safeURL?: any ; name: string; objectURL?: string; size: number; };
  @Input() media?: Media;
  @Input({required: true}) attachmentType!: 'pictures' | 'documents' | 'videos';
  readonly PrimeIcons = PrimeIcons;
  selectedFile?: { safeURL?: any; name: string; objectURL?: string; size: number };
  showPdfInDialog = false;

  constructor(private mediasService: MediasService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    if (!this.file && this.media) {
      this.mediasService.getMedia(this.media).subscribe((response: {
        media: Media,
        blob: Blob
      }) => {
        this.file = new File([response.blob], response.media.fileName, {type: response.media.mimeType});
        (this.file as any).objectURL = URL.createObjectURL(response.blob);
        if (this.attachmentType === 'documents') {
          this.file.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(response.blob));
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.file && this.file.objectURL) {
      URL.revokeObjectURL(this.file.objectURL)
    }
  }

  openPdfInDialog(file: { safeURL?: any; name: string; objectURL?: string; size: number }) {
    this.selectedFile = file;
    this.showPdfInDialog = true;
  }
}
