import { Injectable } from '@angular/core';
import { UserRole } from '../../users/entities/user.entity';
import { UserAccess } from '../models/user-access.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) {
  }

  getRole(defaultUserRole = UserRole.USER): UserRole {
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken && decodedToken.role) {
      if (decodedToken.role === UserRole.ADMIN) {
        return UserRole.ADMIN;
      } else if (decodedToken.role === UserRole.MANAGER) {
        return UserRole.MANAGER;
      }
    }
    return defaultUserRole;
  }

  get isAdmin(): boolean {
    return UserRole.ADMIN === this.getRole();
  }

  get isManager(): boolean {
    return UserRole.MANAGER === this.getRole();
  }

  get userId(): number {
    const decodedToken = this.authService.getDecodedToken();
    return decodedToken?.sub || 0;
  }

  getUserAccess(): UserAccess {
    const decodedToken = this.authService.getDecodedToken();
    return decodedToken?.userAccess ? {...decodedToken?.userAccess} : new UserAccess();
  }
}
