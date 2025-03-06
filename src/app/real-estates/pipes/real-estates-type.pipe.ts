import { Pipe, PipeTransform } from '@angular/core';
import { RealEstateService } from '../real-estate.service';
import { RealEstateType } from '../model/real-estate-type.enum';

@Pipe({
  name: 'realEstatesType'
})
export class RealEstatesTypePipe implements PipeTransform {

  constructor(private realEstateService: RealEstateService,) {
  }

  transform(type: RealEstateType): string {
    return this.realEstateService.getRealEstateFormatedType(type);
  }

}
