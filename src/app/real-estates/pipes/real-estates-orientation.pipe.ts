import { Pipe, PipeTransform } from '@angular/core';
import { RealEstateService } from '../real-estate.service';
import { RealEstateOrientation } from '../model/real-estate-orientation.enum';

@Pipe({
  name: 'realEstatesOrientation'
})
export class RealEstatesOrientationPipe implements PipeTransform {

  constructor(private realEstateService: RealEstateService,) {
  }

  transform(type: RealEstateOrientation): string {
    return this.realEstateService.getRealEstateFormatedOrientation(type);
  }

}
