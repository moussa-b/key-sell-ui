import { Sex } from '../../core/models/sex.enum';

export class SaveUserDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  password?: string;
  preferredLanguage?: string;
  sex?: Sex;
  username?: string;
}
