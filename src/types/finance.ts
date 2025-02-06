export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card';

export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFormData {
  paymentDate: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface DocumentLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalLineAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine extends DocumentLine {
  invoiceId: string;
}

export interface QuoteLine extends DocumentLine {
  quoteId: string;
}

export interface DocumentLineFormData {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  companyId: string;
  contactId?: string | null;
  projectId: string | null;
  number: number;
  quoteNumber: string;
  quoteDate: string;
  status: QuoteStatus;
  totalAmount: number;
  lines: QuoteLine[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  contactId?: string | null;
  projectId: string | null;
  invoiceDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  lines: InvoiceLine[];
  createdAt: string;
  updatedAt: string;
}

export type QuoteFormData = Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;