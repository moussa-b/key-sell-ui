import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../models/address.model';
import { AddressService } from '../services/address.service';

@Pipe({
  name: 'formatAddress'
})
export class AddressPipe implements PipeTransform {

  transform(address: Address, unknownLabel = '-'): string {
    return AddressService.format(address, unknownLabel);
  }
}
