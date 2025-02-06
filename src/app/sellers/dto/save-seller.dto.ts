import { Sex } from '../../core/models/sex.enum';

export class SaveSellerDto {
  address?: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone?: string;
  preferredLanguage?: string;
  sex?: Sex;
}
