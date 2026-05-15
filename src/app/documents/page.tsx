"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Receipt,
  Search,
  Trash2,
  Copy,
  Download,
  Calendar,
  Building2,
  Filter,
  X,
  FolderOpen,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDocuments } from "@/hooks/use-documents";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { downloadQuotationPDF } from "@/templates/quotation-pdf";
import { downloadInvoicePDF } from "@/templates/invoice-pdf";
import { DocumentData, QuotationData, InvoiceData } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function DocumentsPage() {
  const router = useRouter();
  const { documents, deleteDocument, duplicateDocument } = useDocuments();
  const company = useCompanySettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "quotation" | "invoice">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      (doc.type === "quotation" ? doc.quotationNumber : doc.invoiceNumber)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doc.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || doc.type === filterType;

    const docDate = doc.type === "quotation" ? (doc as QuotationData).date : (doc as InvoiceData).invoiceDate;
    const matchesDate = !dateFilter || docDate === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const handleDownload = async (doc: DocumentData) => {
    setPdfLoadingId(doc.id);
    try {
      if (doc.type === "quotation") {
        await downloadQuotationPDF(doc as QuotationData, company);
      } else {
        await downloadInvoicePDF(doc as InvoiceData, company);
      }
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Documents
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Manage your quotations and invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/quotation">
              <Button size="sm"><FileText className="mr-2 h-4 w-4" />New Quotation</Button>
            </Link>
            <Link href="/invoice">
              <Button variant="outline" size="sm"><Receipt className="mr-2 h-4 w-4" />New Invoice</Button>
            </Link>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by number, company, or client..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100 dark:bg-gray-800" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-3"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Type</label>
                    <div className="mt-2 flex gap-2">
                      {(["all", "quotation", "invoice"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            filterType === type
                              ? "bg-red-700 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                      {dateFilter && (
                        <button onClick={() => setDateFilter("")} className="text-gray-400 hover:text-gray-600">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredDocs.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 bg-transparent dark:border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
              <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                {documents.length === 0 ? "No documents yet" : "No matching documents"}
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                {documents.length === 0
                  ? "Create your first quotation or invoice to get started"
                  : "Try adjusting your search or filters"}
              </p>
              {documents.length === 0 && (
                <div className="mt-6 flex gap-3">
                  <Link href="/quotation"><Button>Create Quotation</Button></Link>
                  <Link href="/invoice"><Button variant="outline">Create Invoice</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-all bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          doc.type === "quotation"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-950/30"
                            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30"
                        }`}
                      >
                        {doc.type === "quotation" ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <Receipt className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {doc.type === "quotation" ? doc.quotationNumber : doc.invoiceNumber}
                          </p>
                          <Badge
                            variant={
                              doc.type === "quotation" ? "secondary" : doc.paymentStatus === "paid" ? "success" : "default"
                            }
                          >
                            {doc.type === "quotation" ? "Quotation" : doc.paymentStatus}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {doc.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {doc.type === "quotation" ? (doc as QuotationData).date : (doc as InvoiceData).invoiceDate}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            OMR {formatCurrency(doc.totalAmount, doc.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const route = doc.type === "quotation"
                            ? `/quotation?edit=${doc.id}`
                            : `/invoice?edit=${doc.id}`;
                          router.push(route);
                        }}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={pdfLoadingId === doc.id}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => duplicateDocument(doc.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this document?")) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
