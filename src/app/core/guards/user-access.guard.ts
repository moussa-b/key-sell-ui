import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { UserAccess } from '../models/user-access.model';

export const userAccessGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const userAccess: UserAccess = permissionService.getUserAccess();
  let field: string = route.data['userAccessFieldName'];
  if (route.data && field && userAccess[field as keyof UserAccess]) {
    return true;
  }
  const router = inject(Router);
  return router.createUrlTree(['']);
};
