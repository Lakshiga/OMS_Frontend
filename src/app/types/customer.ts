export interface Customer {
  id: number;
  CustomerCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerRequest {
  CustomerCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
