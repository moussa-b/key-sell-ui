// https://blog.angular-university.io/angular-loading-indicator/
// Prevent loading indicator to be shown : this.http.get("/api/courses", { context: new HttpContext().set(SkipLoading, true) });
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const SkipLoading = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  if (req.context.get(SkipLoading)) {
    return next(req);
  }
  const loadingTimeout = setTimeout(() => loadingService.loadingOn(), 500);
  return next(req).pipe(
    finalize(() => {
      clearTimeout(loadingTimeout); // Clear timeout if request finishes before 500ms
      loadingService.loadingOff();
    })
  );
};
