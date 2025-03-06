import { Component, Input } from '@angular/core';
import { RealEstatesMediaComponent } from '../real-estates-media/real-estates-media.component';
import { PrimeNG } from 'primeng/config';
import { Media } from '../../core/models/media.model';

@Component({
  selector: 'ks-real-estates-media-card',
  imports: [
    RealEstatesMediaComponent
  ],
  templateUrl: './real-estates-media-card.component.html',
})
export class RealEstatesMediaCardComponent {
  @Input() file?: { name: string; objectURL: string; size: number };
  @Input() media?: Media;
  @Input() showFileSize = true;
  @Input({required: true}) attachmentType!: 'pictures' | 'documents' | 'videos';

  constructor(private config: PrimeNG) {
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
