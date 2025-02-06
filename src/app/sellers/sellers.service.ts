import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Seller } from './entities/seller.entity';
import { SaveSellerDto } from './dto/save-seller.dto';

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

  update(userId: number, updateSellerDto: SaveSellerDto): Observable<Seller> {
    return this.http.patch<Seller>(`${environment.API_URL}/api/sellers/${userId}`, updateSellerDto);
  }

  remove(userId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/sellers/${userId}`);
  }
}
