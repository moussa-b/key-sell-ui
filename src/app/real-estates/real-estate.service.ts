import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RealEstate } from './model/real-estate';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LabelValue } from '../core/models/label-value.model';
import { SaveRealEstateDto } from './dto/save-real-estate.dto';

@Injectable({
  providedIn: 'root'
})
export class RealEstateService {

  constructor(private http: HttpClient) {
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
}
