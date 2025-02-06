export interface Company {
  id: string;
  name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  siret?: string;
  vat?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanyFormData = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;