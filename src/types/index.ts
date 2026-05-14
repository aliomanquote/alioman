export interface QuotationItem {
  id: string;
  slNo: number;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface QuotationData {
  id: string;
  type: 'quotation';
  quotationNumber: string;
  date: string;
  clientName: string;
  companyName: string;
  address: string;
  subject: string;
  scopeOfWork: string;
  items: QuotationItem[];
  notes: string;
  paymentTerms: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  signatureName: string;
  contactNumber: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  slNo: number;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  type: 'invoice';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  companyName: string;
  address: string;
  subject: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  notes: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  signatureName: string;
  contactNumber: string;
  currency: string;
  createdAt: string;
}

export type DocumentData = QuotationData | InvoiceData;

export interface CompanySettings {
  name: string;
  arabicName: string;
  crNumber: string;
  poBox: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  logoText: string;
  tagline: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const defaultCompanySettings: CompanySettings = {
  name: "ABDUL REHMAN DEVELOPMENT BUSINESS LLC",
  arabicName: "عبد الرحمن للأعمال المتطورة ش ش و",
  crNumber: "1459267",
  poBox: "0",
  postalCode: "112",
  country: "Sultanate of Oman",
  phone: "+968 97461211",
  email: "abdabdulrehman1211@gmail.com",
  logoText: "ADB",
  tagline: "ABDUL REHMAN DEVELOPMENT BUSINESS LLC",
  bankName: "Bank Muscat",
  accountNumber: "0337064545490013",
  accountName: "ABDUL REHMAN DEVELOPMENT BUSINESS LLC",
};
