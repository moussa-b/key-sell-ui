import { Sex } from '../../core/models/sex.enum';

export class User {
  id?: number;
  uuid!: number;
  username!: string;
  email!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  sex?: Sex;
  preferredLanguage?: string;
  role!: UserRole;
  isActive?: boolean;
  activationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER"
}
