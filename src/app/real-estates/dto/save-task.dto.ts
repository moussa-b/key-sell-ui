export interface SaveTaskDto {
  id?: number;
  uuid: string;
  type: string;
  title: string;
  description: string;
  date: string;
  hour: string;
  duration: number;
  users?: number[];
  tasks?: number[];
  realEstateId?: number;
  createdBy?: number;
  updatedBy?: number;
}
