import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RealEstate } from './model/real-estate';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LabelValue } from '../core/models/label-value.model';
import { SaveRealEstateDto } from './dto/save-real-estate.dto';
import { RealEstateType } from './model/real-estate-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { ResponseStatus } from '../core/models/response-status.model';
import { RealEstateStatus } from './model/real-estate-status.enum';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable({
  providedIn: 'root'
})
export class RealEstateService {
  constructor(private http: HttpClient, private translateService: TranslateService) {
  }

  findAll(): Observable<RealEstate[]> {
    return this.http.get<RealEstate[]>(`${environment.API_URL}/api/real-estates`);
  }

  findOne(realEstateId: number): Observable<RealEstate> {
    return this.http.get<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}`);
  }

  create(saveRealEstateDto: SaveRealEstateDto): Observable<RealEstate> {
    return this.http.post<RealEstate>(`${environment.API_URL}/api/real-estates`, saveRealEstateDto);
  }

  update(realEstateId: number, saveRealEstateDto: SaveRealEstateDto): Observable<RealEstate> {
    return this.http.patch<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}`, saveRealEstateDto);
  }

  updateStatus(realEstateId: number, statusDto: UpdateStatusDto): Observable<RealEstate> {
    return this.http.patch<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}/status`, statusDto);
  }

  findAllOwners(): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/owners`);
  }


  findAllBuyers(): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/buyers`);
  }

  remove(realEstateId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/real-estates/${realEstateId}`);
  }

  removePictures(realEstateId: number, pictureUuid: string): Observable<ResponseStatus> {
    return this.http.delete<ResponseStatus>(`${environment.API_URL}/api/real-estates/${realEstateId}/pictures/${pictureUuid}`);
  }

  export(realEstateId: number): void {
    this.http.get(`${environment.API_URL}/api/real-estates/${realEstateId}/export`, {observe: 'response', responseType: 'arraybuffer'}).subscribe(
      {
        next: (response: HttpResponse<ArrayBuffer>) => {
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `export_real_estate_${realEstateId}.pdf`;
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match && match.length > 1) {
              filename = match[1];
            }
          }
          const blob = new Blob([response.body!], {type: 'application/pdf'});
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => console.error('Error downloading PDF:', error)
      }
    );
  }

  getRealEstatesTypes(): LabelValue<RealEstateType>[] {
    return [
      {label: this.translateService.instant('real_estates.house'), value: RealEstateType.HOUSE},
      {label: this.translateService.instant('real_estates.villa'), value: RealEstateType.VILLA},
      {label: this.translateService.instant('real_estates.apartment'), value: RealEstateType.APARTMENT},
      {label: this.translateService.instant('common.other'), value: RealEstateType.NONE}
    ]
  }

  getRealEstatesStatusOptions(includeOther = false): LabelValue<RealEstateStatus>[] {
    return [
      {label: this.translateService.instant('real_estates.for_sale'), value: RealEstateStatus.FOR_SALE},
      {label: this.translateService.instant('real_estates.sale_in_progress'), value: RealEstateStatus.SALE_IN_PROGRESS},
      {label: this.translateService.instant('real_estates.sold'), value: RealEstateStatus.SOLD},
      ...(includeOther ? [{label: this.translateService.instant('common.other'), value: RealEstateStatus.NONE}] : [])
    ]
  }

  getRealEstateFormatedType(type: RealEstateType): string {
    switch (type) {
      case RealEstateType.APARTMENT:
        return this.translateService.instant('real_estates.apartment');
      case RealEstateType.VILLA:
        return this.translateService.instant('real_estates.villa');
      case RealEstateType.HOUSE:
        return this.translateService.instant('real_estates.house');
    }
    return this.translateService.instant('common.other');
  }

  getRealEstateFormatedStatus(status: RealEstateStatus) {
    switch (status) {
      case RealEstateStatus.FOR_SALE:
        return this.translateService.instant('real_estates.for_sale');
      case RealEstateStatus.SALE_IN_PROGRESS:
        return this.translateService.instant('real_estates.sale_in_progress');
      case RealEstateStatus.SOLD:
        return this.translateService.instant('real_estates.sold');
    }
    return this.translateService.instant('common.other');
  }
}
