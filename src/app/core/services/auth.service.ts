import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../../users/entities/user.entity';
import { HttpClient, HttpContext } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { SaveUserDto } from '../../users/dto/save-user.dto';
import { SkipErrorDetection } from '../interceptors/error.interceptor';
import { AccessToken } from '../models/access-token.model';
import { UserAccess } from '../models/user-access.model';
import { ResponseStatus } from '../models/response-status.model';

export interface DecodedToken {
  sub: number;
  role: UserRole;
  iat: number;
  exp: number;
  userAccess: UserAccess
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtToken?: string;
  decodedToken?: DecodedToken;

  constructor(private storageService: StorageService,
              private http: HttpClient) {
    this.jwtToken = this.storageService.get('jwtToken') ? this.storageService.get('jwtToken')! : undefined;
  }

  login(username: string, password: string, rememberMe: boolean): Observable<AccessToken> {
    return this.http.post<AccessToken>(
      `${environment.API_URL}/api/auth/login`,
      {username, password},
      {context: new HttpContext().set(SkipErrorDetection, true)})
      .pipe(map((response: AccessToken) => {
        if (rememberMe) {
          this.storageService.setStorage(localStorage);
        }
        this.jwtToken = response.accessToken;
        this.storageService.set('jwtToken', this.jwtToken);
        return response;
      }));
  }

  activate(username: string, password: string, activationToken: string): Observable<ResponseStatus> {
    return this.http.post<ResponseStatus>(`${environment.API_URL}/api/auth/activate`, {username, password, activationToken});
  }

  resetPassword(username: string, password: string, resetPasswordToken: string): Observable<ResponseStatus> {
    return this.http.post<ResponseStatus>(`${environment.API_URL}/api/auth/password/reset`, {username, password, resetPasswordToken});
  }

  forgotPassword(email: string): Observable<ResponseStatus> {
    return this.http.post<ResponseStatus>(`${environment.API_URL}/api/auth/password/forgot`, {email});
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/api/auth/profile`);
  }

  updateProfile(updateClientDto: SaveUserDto): Observable<User> {
    return this.http.patch<User>(`${environment.API_URL}/api/auth/profile`, updateClientDto);
  }

  updateProfileSecurity(securityFormValue: any): Observable<ResponseStatus> {
    return this.http.patch<ResponseStatus>(`${environment.API_URL}/api/auth/profile/security`, securityFormValue);
  }

  logout(): void {
    this.jwtToken = undefined;
    this.decodedToken = undefined;
    this.storageService.remove('jwtToken');
  }

  isAuthenticated(): boolean {
    return !!(this.jwtToken && this.jwtToken?.length > 0) && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const expiryTime = this.getExpiryTime();
    if (expiryTime) {
      console.log('Automatic deconnexion after token expiration');
      return ((1000 * expiryTime) - (new Date()).getTime()) < 5000;
    } else {
      return false;
    }
  }

  getExpiryTime(): number | undefined {
    return this.getDecodedToken()?.exp;
  }

  getDecodedToken(): DecodedToken | undefined {
    if (this.jwtToken) {
      if (!this.decodedToken) {
        try {
          this.decodedToken = jwtDecode<DecodedToken>(this.jwtToken);
          console.log('--> this.decodedToken.userAccess = ', this.decodedToken.userAccess);
          return {...this.decodedToken};
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      } else {
        return this.decodedToken;
      }
    }
    return undefined;
  }

  getJwtToken(): string | undefined {
    return this.jwtToken;
  }
}
