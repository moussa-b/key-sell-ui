import { Sex } from '../../core/models/sex.enum';

export class SaveClientDto {
  address?: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone?: string;
  preferredLanguage?: string;
  sex?: Sex;
}
