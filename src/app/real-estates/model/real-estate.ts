import { RealEstateType } from './real-estate-type.enum';
import { Address } from '../../core/models/address.model';
import { LabelValue } from '../../core/models/label-value.model';
import { Media } from '../../core/models/media.model';
import { RealEstateStatus } from './real-estate-status.enum';

export interface RealEstate {
  id: number;
  type: RealEstateType;
  terraced: boolean;
  surface: number;
  roomCount: number;
  showerCount?: number;
  terraceCount?: number;
  hasGarden?: boolean;
  gardenSurface?: number;
  isSecured?: boolean;
  securityDetail?: string;
  facadeCount?: number;
  location?: string;
  price: number;
  priceCurrency: string;
  remark?: string;
  address: Address;
  owners: number[];
  ownersDetails?: LabelValue<number>[];
  buyers?: number[];
  buyersDetails?: LabelValue<string>[];
  medias: Media[];
  status: RealEstateStatus;
  statusRemark: string;
  saleDate?: string;
  finalSellingPrice: number;
  createdBy?: number;
  createdAt: Date;
  updatedBy?: number;
  updatedAt?: Date;
}
