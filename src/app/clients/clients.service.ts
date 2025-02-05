import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Client } from './entities/client.entity';
import { SaveClientDto } from './dto/save-client.dto';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: HttpClient) { }

  findAll(): Observable<Client[]> {
    return this.http.get<Client[]>(`${environment.API_URL}/api/clients`);
  }

  create(createClientDto: SaveClientDto): Observable<Client> {
    return this.http.post<Client>(`${environment.API_URL}/api/clients`, createClientDto);
  }

  update(userId: number, updateClientDto: SaveClientDto): Observable<Client> {
    return this.http.patch<Client>(`${environment.API_URL}/api/clients/${userId}`, updateClientDto);
  }

  remove(userId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/clients/${userId}`);
  }
}
