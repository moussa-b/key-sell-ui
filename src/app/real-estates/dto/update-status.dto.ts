import { RealEstateStatus } from '../model/real-estate-status.enum';

export interface UpdateStatusDto {
  status: RealEstateStatus;
  statusRemark: string;
  saleDate?: Date;
  finalSellingPrice?: number;
  buyers?: number[];
}
