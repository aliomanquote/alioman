import { z } from "zod";

export const quotationItemSchema = z.object({
  id: z.string(),
  slNo: z.number().min(1),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number().min(0),
});

export const quotationSchema = z.object({
  quotationNumber: z.string().min(1, "Quotation number is required"),
  date: z.string().min(1, "Date is required"),
  clientName: z.string().min(1, "Client name is required"),
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  subject: z.string().min(1, "Subject is required"),
  scopeOfWork: z.string().default(""),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  notes: z.string().default(""),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  signatureName: z.string().min(1, "Signature name is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  totalAmount: z.number().min(0),
  currency: z.string().default("OMR"),
});

export const invoiceItemSchema = z.object({
  id: z.string(),
  slNo: z.number().min(1),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number().min(0),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  clientName: z.string().min(1, "Client name is required"),
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  subject: z.string().default(""),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().min(0),
  taxPercent: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  discount: z.number().min(0),
  totalAmount: z.number().min(0),
  paymentStatus: z.enum(["pending", "paid", "overdue"]),
  notes: z.string().optional(),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  signatureName: z.string().min(1, "Signature name is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  currency: z.string().default("OMR"),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
