import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { RealEstate } from '../model/real-estate';
import { Card } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { RealEstatesTypePipe } from '../pipes/real-estates-type.pipe';
import { AddressPipe } from '../../core/pipes/address.pipe';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Media, MediaType } from '../../core/models/media.model';
import { RealEstatesMediaCardComponent } from '../real-estates-media-card/real-estates-media-card.component';

@Component({
  selector: 'ks-real-estates-record',
  imports: [
    Card,
    PrimeTemplate,
    RealEstatesTypePipe,
    AddressPipe,
    DatePipe,
    TranslatePipe,
    RealEstatesMediaCardComponent
  ],
  templateUrl: './real-estates-record.component.html',
  styleUrl: './real-estates-record.component.scss'
})
export class RealEstatesRecordComponent implements OnInit {
  realEstate!: RealEstate;
  pictures: Media[] = [];
  videos: Media[] = [];
  documents: Media[] = [];

  constructor(private dialogConfig: DynamicDialogConfig,) {
  }

  ngOnInit(): void {
    this.realEstate = this.dialogConfig.data.realEstate;
    if (this.realEstate.medias && this.realEstate.medias.length > 0) {
      this.realEstate.medias.forEach((m: Media) => {
        switch (m.mediaType) {
          case MediaType.IMAGE:
            this.pictures.push(m);
            break;
          case MediaType.VIDEO:
            this.videos.push(m);
            break;
          case MediaType.DOCUMENT:
            this.documents.push(m);
            break;
        }
      })
    }
  }
}
