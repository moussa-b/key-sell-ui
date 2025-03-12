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
    return decodedToken?.id || 0;
  }

  get userRole(): UserRole | undefined {
    const decodedToken = this.authService.getDecodedToken();
    return decodedToken ? decodedToken.role : undefined;
  }

  get userIdentity(): string | undefined {
    const decodedToken = this.authService.getDecodedToken();
    return decodedToken ? `${decodedToken.firstName} ${decodedToken.lastName.toUpperCase()}` : undefined;
  }

  getUserAccess(): UserAccess {
    const decodedToken = this.authService.getDecodedToken();
    return decodedToken?.userAccess ? {...decodedToken?.userAccess} : new UserAccess();
  }
}
