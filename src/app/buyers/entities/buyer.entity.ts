import { Client } from '../../core/models/client.entity';

export interface Buyer extends Client {
  budget: number;
  budgetCurrency: string;
}
