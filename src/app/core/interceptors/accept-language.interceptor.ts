import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const acceptLanguageInterceptor: HttpInterceptorFn = (req, next) => {
  const translateService = inject(TranslateService);
  const currentLang = translateService.currentLang || 'en';
  req = req.clone({headers: req.headers.set('Accept-Language', currentLang)});
  return next(req);
};
