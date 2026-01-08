export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerRequest {
  customerCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
