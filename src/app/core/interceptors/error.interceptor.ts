import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToasterService } from '../services/toaster.service';
import { TranslateService } from '@ngx-translate/core';

export const SkipErrorDetection = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);
  const translateService = inject(TranslateService);
  if (req.context.get(SkipErrorDetection)) {
    return next(req);
  } else {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        toasterService.emitValue({
          detail: error.error?.message || translateService.instant('common.error'),
          severity: 'error',
          summary: translateService.instant('common.error')
        })
        return throwError(() => error);
      })
    );
  }
};
