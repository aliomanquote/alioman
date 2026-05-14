"use client";

import { useLocalStorage } from "./use-local-storage";
import { DocumentData, QuotationData, InvoiceData } from "@/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "quotation-documents";

export function useDocuments() {
  const [documents, setDocuments] = useLocalStorage<DocumentData[]>(STORAGE_KEY, []);

  const addDocument = (doc: Omit<DocumentData, "id" | "createdAt">): DocumentData => {
    const base = {
      ...doc,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const newDoc = doc.type === "quotation"
      ? { ...base, type: "quotation" as const }
      : { ...base, type: "invoice" as const };

    setDocuments((prev) => [newDoc as DocumentData, ...prev]);
    return newDoc as DocumentData;
  };

  const updateDocument = (id: string, updates: Partial<DocumentData>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } as DocumentData : doc))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const getDocument = (id: string): DocumentData | undefined => {
    return documents.find((doc) => doc.id === id);
  };

  const duplicateDocument = (id: string): DocumentData | null => {
    const doc = getDocument(id);
    if (!doc) return null;

    const base = {
      ...doc,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    let newDoc: DocumentData;
    if (doc.type === "quotation") {
      const qDoc = doc as QuotationData;
      newDoc = {
        ...base,
        type: "quotation",
        quotationNumber: qDoc.quotationNumber + "-COPY",
      } as QuotationData;
    } else {
      const iDoc = doc as InvoiceData;
      newDoc = {
        ...base,
        type: "invoice",
        invoiceNumber: iDoc.invoiceNumber + "-COPY",
      } as InvoiceData;
    }

    setDocuments((prev) => [newDoc, ...prev]);
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
