import { Component, Input } from '@angular/core';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'ks-real-estates-media',
  templateUrl: './real-estates-media.component.html',
  styleUrl: './real-estates-media.component.scss'
})
export class RealEstatesMediaComponent {
  @Input({required: true}) file!: {name: string; objectURL: string; size: number};
  @Input({required: true}) attachmentType!: 'pictures' | 'documents' | 'videos';
  readonly PrimeIcons = PrimeIcons;
}
