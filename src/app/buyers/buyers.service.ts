import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Buyer } from './entities/buyer.entity';
import { SaveBuyerDto } from './dto/save-buyer.dto';
import { SendEmailModel } from '../core/models/send-email.model';
import { ResponseStatus } from '../core/models/response-status.model';

@Injectable({
  providedIn: 'root'
})
export class BuyersService {

  constructor(private http: HttpClient) { }

  findAll(): Observable<Buyer[]> {
    return this.http.get<Buyer[]>(`${environment.API_URL}/api/buyers`);
  }

  create(createBuyerDto: SaveBuyerDto): Observable<Buyer> {
    return this.http.post<Buyer>(`${environment.API_URL}/api/buyers`, createBuyerDto);
  }

  update(buyerId: number, updateBuyerDto: SaveBuyerDto): Observable<Buyer> {
    return this.http.patch<Buyer>(`${environment.API_URL}/api/buyers/${buyerId}`, updateBuyerDto);
  }

  remove(buyerId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/buyers/${buyerId}`);
  }

  sendEmail(buyerId: number, sendEmail: SendEmailModel): Observable<ResponseStatus> {
    return this.http.post<ResponseStatus>(`${environment.API_URL}/api/buyers/${buyerId}/email/sent`, sendEmail);
  }
}
