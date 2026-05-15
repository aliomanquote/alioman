"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export interface Document {
  id: string;
  type: "quotation" | "invoice";
  documentNumber: string;
  clientName: string;
  companyName: string;
  address: string;
  subject: string;
  date?: string;
  invoiceDate?: string;
  dueDate?: string;
  items: any[];
  notes: string;
  paymentTerms?: string;
  paymentStatus?: string;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  signatureName: string;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
}

export function useSupabaseDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(
        data.map((row) => ({
          id: row.id,
          type: row.type,
          documentNumber: row.document_number,
          clientName: row.client_name || "",
          companyName: row.company_name || "",
          address: row.address || "",
          subject: row.subject || "",
          date: row.date || "",
          invoiceDate: row.invoice_date || "",
          dueDate: row.due_date || "",
          items: row.items || [],
          notes: row.notes || "",
          paymentTerms: row.payment_terms || "",
          paymentStatus: row.payment_status || "pending",
          subtotal: Number(row.subtotal) || 0,
          taxPercent: Number(row.tax_percent) || 0,
          taxAmount: Number(row.tax_amount) || 0,
          discount: Number(row.discount) || 0,
          totalAmount: Number(row.total_amount) || 0,
          currency: row.currency || "OMR",
          bankName: row.bank_name || "",
          accountNumber: row.account_number || "",
          accountName: row.account_name || "",
          signatureName: row.signature_name || "",
          contactNumber: row.contact_number || "",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = async (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        type: doc.type,
        document_number: doc.documentNumber,
        client_name: doc.clientName,
        company_name: doc.companyName,
        address: doc.address,
        subject: doc.subject,
        date: doc.date,
        invoice_date: doc.invoiceDate,
        due_date: doc.dueDate,
        items: doc.items,
        notes: doc.notes,
        payment_terms: doc.paymentTerms,
        payment_status: doc.paymentStatus,
        subtotal: doc.subtotal,
        tax_percent: doc.taxPercent,
        tax_amount: doc.taxAmount,
        discount: doc.discount,
        total_amount: doc.totalAmount,
        currency: doc.currency,
        bank_name: doc.bankName,
        account_number: doc.accountNumber,
        account_name: doc.accountName,
        signature_name: doc.signatureName,
        contact_number: doc.contactNumber,
      })
      .select()
      .single();

    if (!error && data) {
      await fetchDocuments();
      return {
        id: data.id,
        createdAt: data.created_at,
      };
    }
    return null;
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    if (!user) return;

    const payload: any = {};
    if (updates.documentNumber !== undefined) payload.document_number = updates.documentNumber;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.subject !== undefined) payload.subject = updates.subject;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.invoiceDate !== undefined) payload.invoice_date = updates.invoiceDate;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.items !== undefined) payload.items = updates.items;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.paymentTerms !== undefined) payload.payment_terms = updates.paymentTerms;
    if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
    if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal;
    if (updates.taxPercent !== undefined) payload.tax_percent = updates.taxPercent;
    if (updates.taxAmount !== undefined) payload.tax_amount = updates.taxAmount;
    if (updates.discount !== undefined) payload.discount = updates.discount;
    if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.bankName !== undefined) payload.bank_name = updates.bankName;
    if (updates.accountNumber !== undefined) payload.account_number = updates.accountNumber;
    if (updates.accountName !== undefined) payload.account_name = updates.accountName;
    if (updates.signatureName !== undefined) payload.signature_name = updates.signatureName;
    if (updates.contactNumber !== undefined) payload.contact_number = updates.contactNumber;
    payload.updated_at = new Date().toISOString();

    await supabase.from("documents").update(payload).eq("id", id).eq("user_id", user.id);
    await fetchDocuments();
  };

  const deleteDocument = async (id: string) => {
    if (!user) return;
    await supabase.from("documents").delete().eq("id", id).eq("user_id", user.id);
    await fetchDocuments();
  };

  return {
    documents,
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
