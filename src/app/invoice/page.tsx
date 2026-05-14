"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Receipt, Eye, Download, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { invoiceSchema } from "@/lib/schemas";
import { generateDocumentNumber, formatCurrency, numberToWords } from "@/lib/utils";
import { useDocuments } from "@/hooks/use-documents";
import { downloadInvoicePDF } from "@/templates/invoice-pdf";
import { defaultCompanySettings } from "@/types";
import { useCompanySettings } from "@/hooks/use-company-settings";

export default function InvoicePage() {
  const { documents, addDocument } = useDocuments();
  const company = useCompanySettings();
  const [showPreview, setShowPreview] = useState(false);
  const [savedDoc, setSavedDoc] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const existingNumbers = documents
    .filter((d) => d.type === "invoice")
    .map((d) => d.invoiceNumber);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      invoiceNumber: generateDocumentNumber("invoice", existingNumbers),
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      clientName: "",
      companyName: "",
      address: "Sultanate of Oman",
      subject: "",
      items: [
        {
          id: crypto.randomUUID(),
          slNo: 1,
          description: "",
          quantity: 1,
          unit: "Nos",
          rate: 0,
          amount: 0,
        },
      ],
      subtotal: 0,
      taxPercent: 0,
      taxAmount: 0,
      discount: 0,
      totalAmount: 0,
      paymentStatus: "pending" as const,
      notes: "",
      bankName: defaultCompanySettings.bankName,
      accountNumber: defaultCompanySettings.accountNumber,
      accountName: defaultCompanySettings.accountName,
      signatureName: "",
      contactNumber: "",
      currency: "OMR",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxPercent = watch("taxPercent") || 0;
  const taxAmount = subtotal * (taxPercent / 100);
  const discount = watch("discount") || 0;
  const totalAmount = subtotal + taxAmount - discount;
  const currency = watch("currency");
  const paymentStatus = watch("paymentStatus") as string;

  const updateAmount = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        const amount = (item.quantity || 0) * (item.rate || 0);
        setValue(`items.${index}.amount`, amount);
      }
    },
    [items, setValue]
  );

  const onSubmit = (data: any) => {
    const doc = addDocument({
      ...data,
      type: "invoice",
      subtotal,
      taxAmount,
      totalAmount,
    });
    setSavedDoc(doc.id);
    setTimeout(() => setSavedDoc(null), 3000);
  };

  const handleDownload = async () => {
    setPdfLoading(true);
    try {
      const data = watch();
      const invoiceData = {
        ...data,
        type: "invoice" as const,
        id: crypto.randomUUID(),
        subtotal,
        taxAmount,
        totalAmount,
        createdAt: new Date().toISOString(),
      };
      await downloadInvoicePDF(invoiceData, company);
    } finally {
      setPdfLoading(false);
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
              Create Invoice
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Generate a professional invoice for your clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={pdfLoading}>
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? "Generating..." : "PDF"}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {savedDoc && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400"
            >
              Invoice saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Invoice Number</Label>
                    <Input {...register("invoiceNumber")} />
                    {errors.invoiceNumber && <p className="text-xs text-red-500">{String(errors.invoiceNumber.message)}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Date</Label>
                    <Input type="date" {...register("invoiceDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" {...register("dueDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input {...register("clientName")} placeholder="Enter client name" />
                    {errors.clientName && <p className="text-xs text-red-500">{String(errors.clientName.message)}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input {...register("companyName")} placeholder="Enter company name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <select
                      {...register("paymentStatus")}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-3">
                    <Label>Address</Label>
                    <Textarea {...register("address")} rows={2} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Items</CardTitle>
                  <Badge variant="secondary">{fields.length} item(s)</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:grid-cols-12"
                      >
                        <div className="sm:col-span-1">
                          <Label className="text-xs">SL</Label>
                          <Input type="number" {...register(`items.${index}.slNo`, { valueAsNumber: true })} className="mt-1" />
                        </div>
                        <div className="sm:col-span-5">
                          <Label className="text-xs">Description</Label>
                          <Textarea {...register(`items.${index}.description`)} rows={2} className="mt-1" />
                        </div>
                        <div className="sm:col-span-1">
                          <Label className="text-xs">QTY</Label>
                          <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="mt-1" onChange={(e) => { register(`items.${index}.quantity`).onChange(e); updateAmount(index); }} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Unit</Label>
                          <Input {...register(`items.${index}.unit`)} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Rate</Label>
                          <Input type="number" step="0.001" {...register(`items.${index}.rate`, { valueAsNumber: true })} className="mt-1" onChange={(e) => { register(`items.${index}.rate`).onChange(e); updateAmount(index); }} />
                        </div>
                        <div className="sm:col-span-1">
                          <Label className="text-xs">Amount</Label>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm font-semibold">{formatCurrency(items[index]?.amount || 0, currency)}</span>
                            {fields.length > 1 && (
                              <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), slNo: fields.length + 1, description: "", quantity: 1, unit: "Nos", rate: 0, amount: 0 })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>

                  <div className="grid gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tax %</Label>
                      <Input type="number" step="0.01" {...register("taxPercent", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <Input type="number" step="0.001" {...register("discount", { valueAsNumber: true })} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="text-right space-y-1">
                      <p className="text-sm text-gray-500">Subtotal: {formatCurrency(subtotal, currency)}</p>
                      <p className="text-sm text-gray-500">Tax ({taxPercent}%): {formatCurrency(taxAmount, currency)}</p>
                      <p className="text-sm text-gray-500">Discount: {formatCurrency(discount, currency)}</p>
                      <p className="text-2xl font-bold text-emerald-600">Total: {formatCurrency(totalAmount, currency)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader><CardTitle className="text-lg">Additional Information</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea {...register("notes")} rows={3} placeholder="Additional notes..." />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2"><Label>Bank Name</Label><Input {...register("bankName")} /></div>
                    <div className="space-y-2"><Label>Account Number</Label><Input {...register("accountNumber")} /></div>
                    <div className="space-y-2"><Label>Account Name</Label><Input {...register("accountName")} /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Signature Name</Label><Input {...register("signatureName")} placeholder="e.g. ALI RAZA" />{errors.signatureName && <p className="text-xs text-red-500">{String(errors.signatureName.message)}</p>}</div>
                    <div className="space-y-2"><Label>Contact Number</Label><Input {...register("contactNumber")} placeholder="e.g. +968 92903653" />{errors.contactNumber && <p className="text-xs text-red-500">{String(errors.contactNumber.message)}</p>}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="submit" size="lg"><Save className="mr-2 h-5 w-5" />Save Invoice</Button>
                <Button type="button" variant="outline" size="lg" onClick={handleDownload} disabled={pdfLoading}><Download className="mr-2 h-5 w-5" />{pdfLoading ? "Generating PDF..." : "Download PDF"}</Button>
              </div>
            </form>
          </motion.div>

          <AnimatePresence>
            {showPreview && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-500">Live Preview</CardTitle><Badge variant="outline">A4</Badge></div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="scale-[0.55] origin-top-left p-8 w-[727px]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-[28%] text-[8px] leading-relaxed pt-1">
                          <p><strong>CR NO:</strong> {company.crNumber}</p>
                          <p><strong>PO BOX:</strong> {company.poBox}</p>
                          <p><strong>Postal Code:</strong> {company.postalCode}</p>
                          <p>{company.country}</p>
                        </div>
                        <div className="w-[44%] flex flex-col items-center text-center">
                          <div className="w-8 h-8 bg-[#C8102E] rotate-45 flex items-center justify-center mb-2 relative">
                            <span className="text-white font-bold text-xs absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 whitespace-nowrap">{company.logoText}</span>
                          </div>
                          <p className="text-[8px] text-[#C8102E] font-bold" dir="rtl">{company.arabicName}</p>
                          <p className="text-[7px] text-[#C8102E] font-bold uppercase tracking-wide">{company.name}</p>
                        </div>
                        <div className="w-[28%] text-[8px] leading-relaxed text-right pt-1" dir="rtl">
                          <p><strong>س.ت.رق:</strong> {company.crNumber}</p>
                          <p><strong>ص.ب:</strong> {company.poBox}</p>
                          <p><strong>الرمز البريدي:</strong> {company.postalCode}</p>
                          <p>سلطنة عمان</p>
                        </div>
                      </div>
                      <div className="border-t-2 border-[#C8102E] mb-4"></div>

                      <div className="text-right text-xs text-gray-600 mb-3">
                        {paymentStatus === "paid" ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-green-600 text-white font-bold text-[8px] mb-1">PAID</span>
                        ) : paymentStatus === "pending" ? (
                          <span className="inline-block w-10 h-10 rounded-full border-2 border-red-600 text-red-600 font-bold text-[7px] text-center leading-10 mb-1">PENDING</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-red-600 text-white font-bold text-[7px] uppercase -rotate-6 mb-1">PAYMENT DUE</span>
                        )}
                        <p>Invoice #: {watch("invoiceNumber")}</p>
                        <p>Date: {watch("invoiceDate")}</p>
                        <p>Due: {watch("dueDate")}</p>
                      </div>

                      <div className="mb-2 text-sm">
                        <p className="font-semibold">Bill To:</p>
                        <p>{watch("companyName")}</p>
                        <p>{watch("address")}</p>
                      </div>

                      <p className="text-xs font-bold underline mb-2 underline-offset-2">Sub: {watch("subject")}</p>

                      <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                        Dear Sir,<br/>
                        With reference to your enquiry for the above-mentioned works, we are pleased to submit our competitive offer. The full scope of work is detailed below.
                      </p>

                      <h1 className="text-center text-lg font-bold underline mb-3 underline-offset-2">INVOICE</h1>

                      <table className="w-full border-collapse text-xs mb-3 border border-black">
                        <thead>
                          <tr className="border-b border-black bg-gray-100">
                            <th className="border-r border-black p-1.5 text-center w-8">S L</th>
                            <th className="border-r border-black p-1.5 text-center">Description of Work</th>
                            <th className="border-r border-black p-1.5 text-center w-12">Qty</th>
                            <th className="border-r border-black p-1.5 text-center w-14">Rate R.O</th>
                            <th className="p-1.5 text-center w-16">Amount R.O</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i} className="border-b border-black">
                              <td className="border-r border-black p-1.5 text-center">{String(item.slNo).padStart(2, "0")}</td>
                              <td className="border-r border-black p-1.5">{item.description}</td>
                              <td className="border-r border-black p-1.5 text-center">{item.rate === 0 && item.quantity === 0 ? "LS" : item.quantity}</td>
                              <td className="border-r border-black p-1.5 text-center">{item.rate === 0 && item.quantity === 0 ? "LS" : formatCurrency(item.rate, currency)}</td>
                              <td className="p-1.5 text-right">{formatCurrency(item.amount, currency)}</td>
                            </tr>
                          ))}
                          <tr className="border-b border-black font-bold">
                            <td className="border-r border-black p-1.5"></td>
                            <td className="border-r border-black p-1.5">Total</td>
                            <td className="border-r border-black p-1.5"></td>
                            <td className="border-r border-black p-1.5"></td>
                            <td className="p-1.5 text-right">{formatCurrency(totalAmount, currency)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <p className="text-xs font-bold mb-3">{numberToWords(totalAmount, currency === "OMR" ? "Omani Rials" : currency)}</p>

                      <p className="text-xs font-bold mb-1">Account Details</p>
                      <p className="text-xs mb-3">{watch("bankName")} AC NO: {watch("accountNumber")} / {watch("accountName")}</p>

                      <p className="text-xs mb-1">Thanking You...</p>
                      <p className="text-xs mb-2">For {company.name}</p>

                      <div className="text-xs mb-4">
                        <p className="font-bold text-sm">{watch("signatureName")}</p>
                        <p>&#9742; {watch("contactNumber")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
