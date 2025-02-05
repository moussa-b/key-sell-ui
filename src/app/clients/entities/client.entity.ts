import { Sex } from '../../core/models/sex.enum';

export interface Client {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex?: Sex;
  preferredLanguage?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
