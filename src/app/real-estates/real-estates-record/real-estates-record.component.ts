import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RealEstate } from '../model/real-estate';
import { Card } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { RealEstatesTypePipe } from '../pipes/real-estates-type.pipe';
import { AddressPipe } from '../../core/pipes/address.pipe';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ks-real-estates-record',
  imports: [
    Card,
    PrimeTemplate,
    RealEstatesTypePipe,
    AddressPipe,
    DatePipe,
    TranslatePipe
  ],
  templateUrl: './real-estates-record.component.html',
  styleUrl: './real-estates-record.component.scss'
})
export class RealEstatesRecordComponent implements OnInit {
  realEstate!: RealEstate;

  constructor(private dialogRef: DynamicDialogRef,
              private dialogConfig: DynamicDialogConfig,) {
  }

  ngOnInit(): void {
    this.realEstate = this.dialogConfig.data.realEstate;
  }
}
