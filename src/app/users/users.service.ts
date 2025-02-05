import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './entities/user.entity';
import { environment } from '../../environments/environment';
import { SaveUserDto } from './dto/save-user.dto';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.API_URL}/api/users`);
  }

  create(createUserDto: SaveUserDto): Observable<User> {
    return this.http.post<User>(`${environment.API_URL}/api/users`, createUserDto);
  }

  update(userId: number, updateClientDto: SaveUserDto): Observable<User> {
    return this.http.patch<User>(`${environment.API_URL}/api/users/${userId}`, updateClientDto);
  }

  remove(userId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.API_URL}/api/users/${userId}`);
  }
}
