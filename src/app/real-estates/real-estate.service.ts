import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RealEstate } from './model/real-estate';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LabelValue } from '../core/models/label-value.model';
import { SaveRealEstateDto } from './dto/save-real-estate.dto';
import { RealEstateType } from './model/real-estate-type.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RealEstateService {

  constructor(private http: HttpClient, private translateService: TranslateService) {
  }

  findAll(): Observable<RealEstate[]> {
    return this.http.get<RealEstate[]>(`${environment.API_URL}/api/real-estates`);
  }

  create(saveRealEstateDto: SaveRealEstateDto): Observable<RealEstate> {
    return this.http.post<RealEstate>(`${environment.API_URL}/api/real-estates`, saveRealEstateDto);
  }

  update(realEstateId: number, saveRealEstateDto: SaveRealEstateDto): Observable<RealEstate> {
    return this.http.patch<RealEstate>(`${environment.API_URL}/api/real-estates/${realEstateId}`, saveRealEstateDto);
  }

  findAllOwners(): Observable<LabelValue<number>[]> {
    return this.http.get<LabelValue<number>[]>(`${environment.API_URL}/api/real-estates/owners`);
  }

  remove(realEstateId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/real-estates/${realEstateId}`);
  }

  getRealEstatesTypes(): LabelValue<RealEstateType>[] {
    return [
      {label: this.translateService.instant('real_estates.house'), value: RealEstateType.HOUSE},
      {label: this.translateService.instant('real_estates.villa'), value: RealEstateType.VILLA},
      {label: this.translateService.instant('real_estates.apartment'), value: RealEstateType.APARTMENT},
      {label: this.translateService.instant('common.other'), value: RealEstateType.NONE}
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
}
