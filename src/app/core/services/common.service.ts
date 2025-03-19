import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabelValue } from '../models/label-value.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) {
  }

  getSupportedCountries(): Observable<LabelValue<string>[]> {
    return this.http.get<LabelValue<string>[]>(`${environment.API_URL}/api/common/countries`);
  }

  getSupportedCurrencies(): Observable<LabelValue<string>[]> {
    return this.http.get<LabelValue<string>[]>(`${environment.API_URL}/api/common/currencies`);
  }

  getVersion(): Observable<{version: string}> {
    return this.http.get<{version: string}>(`${environment.API_URL}/api/version`);
  }
}
