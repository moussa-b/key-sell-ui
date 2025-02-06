import { Sex } from '../../core/models/sex.enum';

export class SaveBuyerDto {
  address?: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone?: string;
  preferredLanguage?: string;
  sex?: Sex;
}
