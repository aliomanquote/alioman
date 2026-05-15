"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { DocumentData, QuotationData, InvoiceData } from "@/types";
import { generateId } from "@/lib/utils";

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!user) { setDocuments([]); return; }
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setDocuments(data.map((row: any) => rowToDocument(row)));
    }
  }, [user]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const addDocument = (doc: Omit<DocumentData, "id" | "createdAt">): DocumentData => {
    const id = generateId();
    const createdAt = new Date().toISOString();
    const newDoc = { ...doc, id, createdAt } as DocumentData;

    if (user) {
      supabase.from("documents").insert(documentToRow(newDoc, user.id)).then(() => fetchDocuments());
    }

    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<DocumentData>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } as DocumentData : doc))
    );
    if (user) {
      const payload: any = {};
      if ((updates as any).clientName !== undefined) payload.client_name = (updates as any).clientName;
      if ((updates as any).companyName !== undefined) payload.company_name = (updates as any).companyName;
      if ((updates as any).subject !== undefined) payload.subject = (updates as any).subject;
      if ((updates as any).totalAmount !== undefined) payload.total_amount = (updates as any).totalAmount;
      if ((updates as any).paymentStatus !== undefined) payload.payment_status = (updates as any).paymentStatus;
      payload.updated_at = new Date().toISOString();
      supabase.from("documents").update(payload).eq("id", id).eq("user_id", user.id).then(() => {});
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (user) {
      supabase.from("documents").delete().eq("id", id).eq("user_id", user.id).then(() => {});
    }
  };

  const getDocument = (id: string): DocumentData | undefined => {
    return documents.find((doc) => doc.id === id);
  };

  const duplicateDocument = (id: string): DocumentData | null => {
    const doc = getDocument(id);
    if (!doc) return null;

    const newId = generateId();
    const createdAt = new Date().toISOString();
    let newDoc: DocumentData;

    if (doc.type === "quotation") {
      const qDoc = doc as QuotationData;
      newDoc = { ...qDoc, id: newId, createdAt, quotationNumber: qDoc.quotationNumber + "-COPY" } as QuotationData;
    } else {
      const iDoc = doc as InvoiceData;
      newDoc = { ...iDoc, id: newId, createdAt, invoiceNumber: iDoc.invoiceNumber + "-COPY" } as InvoiceData;
    }

    setDocuments((prev) => [newDoc, ...prev]);
    if (user) {
      supabase.from("documents").insert(documentToRow(newDoc, user.id)).then(() => fetchDocuments());
    }
    return newDoc;
  };

  return {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    duplicateDocument,
  };
}

function rowToDocument(row: any): DocumentData {
  const base = {
    id: row.id,
    clientName: row.client_name || "",
    companyName: row.company_name || "",
    address: row.address || "",
    subject: row.subject || "",
    items: row.items || [],
    notes: row.notes || "",
    totalAmount: Number(row.total_amount) || 0,
    currency: row.currency || "OMR",
    bankName: row.bank_name || "",
    accountNumber: row.account_number || "",
    accountName: row.account_name || "",
    signatureName: row.signature_name || "",
    contactNumber: row.contact_number || "",
    createdAt: row.created_at,
  };

  if (row.type === "quotation") {
    return {
      ...base,
      type: "quotation",
      quotationNumber: row.document_number || "",
      date: row.date || "",
      paymentTerms: row.payment_terms || "",
    } as QuotationData;
  } else {
    return {
      ...base,
      type: "invoice",
      invoiceNumber: row.document_number || "",
      invoiceDate: row.invoice_date || "",
      dueDate: row.due_date || "",
      subtotal: Number(row.subtotal) || 0,
      taxPercent: Number(row.tax_percent) || 0,
      taxAmount: Number(row.tax_amount) || 0,
      discount: Number(row.discount) || 0,
      paymentStatus: row.payment_status || "pending",
    } as InvoiceData;
  }
}

function documentToRow(doc: DocumentData, userId: string): any {
  const base: any = {
    id: doc.id,
    user_id: userId,
    type: doc.type,
    client_name: doc.clientName,
    company_name: doc.companyName,
    address: doc.address,
    subject: doc.subject,
    items: doc.items,
    notes: doc.notes,
    total_amount: doc.totalAmount,
    currency: doc.currency,
    bank_name: doc.bankName,
    account_number: doc.accountNumber,
    account_name: doc.accountName,
    signature_name: doc.signatureName,
    contact_number: doc.contactNumber,
    created_at: doc.createdAt,
  };

  if (doc.type === "quotation") {
    const q = doc as QuotationData;
    base.document_number = q.quotationNumber;
    base.date = q.date;
    base.payment_terms = q.paymentTerms;
  } else {
    const i = doc as InvoiceData;
    base.document_number = i.invoiceNumber;
    base.invoice_date = i.invoiceDate;
    base.due_date = i.dueDate;
    base.subtotal = i.subtotal;
    base.tax_percent = i.taxPercent;
    base.tax_amount = i.taxAmount;
    base.discount = i.discount;
    base.payment_status = i.paymentStatus;
  }

  return base;
}
