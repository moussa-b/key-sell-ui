import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Seller } from './entities/seller.entity';
import { SaveSellerDto } from './dto/save-seller.dto';
import { SendEmailModel } from '../core/models/send-email.model';
import { ResponseStatus } from '../core/models/response-status.model';

@Injectable({
  providedIn: 'root'
})
export class SellersService {

  constructor(private http: HttpClient) { }

  findAll(): Observable<Seller[]> {
    return this.http.get<Seller[]>(`${environment.API_URL}/api/sellers`);
  }

  create(createSellerDto: SaveSellerDto): Observable<Seller> {
    return this.http.post<Seller>(`${environment.API_URL}/api/sellers`, createSellerDto);
  }

  update(sellerId: number, updateSellerDto: SaveSellerDto): Observable<Seller> {
    return this.http.patch<Seller>(`${environment.API_URL}/api/sellers/${sellerId}`, updateSellerDto);
  }

  remove(sellerId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/sellers/${sellerId}`);
  }

  sendEmail(buyerId: number, sendEmail: SendEmailModel): Observable<ResponseStatus> {
    return this.http.post<ResponseStatus>(`${environment.API_URL}/api/sellers/${buyerId}/email/sent`, sendEmail);
  }
}
