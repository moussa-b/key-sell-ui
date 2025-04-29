import { Pipe, PipeTransform } from '@angular/core';
import { RealEstateService } from '../real-estate.service';
import { RealEstateAssignment } from '../model/real-estate-assignment.enum';

@Pipe({
  name: 'realEstatesAssignment'
})
export class RealEstatesAssignmentPipe implements PipeTransform {

  constructor(private realEstateService: RealEstateService,) {
  }

  transform(type: RealEstateAssignment): string {
    return this.realEstateService.getRealEstateFormatedAssignment(type);
  }

}
