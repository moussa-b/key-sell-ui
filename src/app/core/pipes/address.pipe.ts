import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../models/address.model';

@Pipe({
  name: 'formatAddress'
})
export class AddressPipe implements PipeTransform {

  transform(address: Address): string {
    if (!address) {
      return '-';
    }
    let formatedAddress = '';
    if (address.street && address.street.trim().length > 0) {
      formatedAddress += address.street;
    }
    if (address.zipCode && address.zipCode.trim().length > 0) {
      formatedAddress += ((formatedAddress.length > 0 ? ' ' : '') + address.zipCode);
    }
    if (address.city && address.city.trim().length > 0) {
      formatedAddress += ((formatedAddress.length > 0 ? ' ' : '') + address.city);
    }
    return formatedAddress.length > 0 ? formatedAddress : '-';
  }
}
