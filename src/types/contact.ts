export type Temperature = 'cold' | 'warm' | 'hot' | 'client';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  companyId?: string | null;
  company?: Company;
  address?: string;
  postal_code?: string;
  city?: string;
  vat?: string;
  temperature: Temperature;
  createdAt: string;
  updatedAt: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;