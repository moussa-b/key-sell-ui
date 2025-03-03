import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { RealEstateService } from './real-estate.service';
import { RealEstate } from './model/real-estate';
import { Observable } from 'rxjs';

export const realEstateResolver: ResolveFn<RealEstate> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RealEstate> => {
  return inject(RealEstateService).findOne(+route.paramMap.get('id')!);
};
