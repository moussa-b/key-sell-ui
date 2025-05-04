import { LabelValue } from '../../core/models/label-value.model';

export interface Task {
  id: number;
  uuid: string;
  type: number;
  status: TaskStatus;
  title: string;
  description: string;
  date: string;
  duration: number;
  users?: number[];
  usersDetails?: LabelValue<number>[];
  createdBy?: number;
  createdAt: string;
  updatedBy?: number;
  updatedAt?: string;
}

export enum TaskStatus {
  NONE = 'NONE',
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
