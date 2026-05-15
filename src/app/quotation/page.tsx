"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText, Eye, Download, Printer, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { quotationSchema, type QuotationFormValues } from "@/lib/schemas";
import { generateDocumentNumber, formatCurrency, numberToWords } from "@/lib/utils";
import { useDocuments } from "@/hooks/use-documents";
import { downloadQuotationPDF } from "@/templates/quotation-pdf";
import { defaultCompanySettings } from "@/types";
import { useCompanySettings } from "@/hooks/use-company-settings";

export default function QuotationPage() {
  const { documents, addDocument } = useDocuments();
  const company = useCompanySettings();
  const [showPreview, setShowPreview] = useState(false);
  const [savedDoc, setSavedDoc] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const existingNumbers = documents
    .filter((d) => d.type === "quotation")
    .map((d) => d.quotationNumber);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues: {
      quotationNumber: generateDocumentNumber("quotation", existingNumbers),
      date: new Date().toISOString().split("T")[0],
      clientName: "",
      companyName: "",
      address: "Sultanate of Oman",
      subject: "",
      scopeOfWork: "",
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
      notes: "",
      paymentTerms: "50% Advance\nAnother 25% Middle work\nRemaining 25% after completion of the 100%",
      bankName: defaultCompanySettings.bankName,
      accountNumber: defaultCompanySettings.accountNumber,
      accountName: defaultCompanySettings.accountName,
      signatureName: "ALI RAZA",
      contactNumber: "+968 92903653",
      totalAmount: 0,
      currency: "OMR",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const currency = watch("currency");

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
      type: "quotation",
      totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
    });
    setSavedDoc(doc.id);
    setTimeout(() => setSavedDoc(null), 3000);
  };

  const handleDownload = async () => {
    setPdfLoading(true);
    try {
      const data = watch();
      const total = items.reduce((sum, item) => sum + item.amount, 0);
      const doc = addDocument({
        ...data,
        type: "quotation",
        totalAmount: total,
      });
      const quotationData = {
        ...data,
        type: "quotation" as const,
        id: doc.id,
        totalAmount: total,
        createdAt: doc.createdAt,
      };
      await downloadQuotationPDF(quotationData, company);
      setSavedDoc(doc.id);
      setTimeout(() => setSavedDoc(null), 3000);
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
              Create Quotation
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Generate a professional quotation for your clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
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
              Quotation saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Header Info */}
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-red-600" />
                    Quotation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Quotation Number</Label>
                    <Input {...register("quotationNumber")} />
                    {errors.quotationNumber && (
                      <p className="text-xs text-red-500">{errors.quotationNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" {...register("date")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input {...register("clientName")} placeholder="Enter client name" />
                    {errors.clientName && (
                      <p className="text-xs text-red-500">{errors.clientName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input {...register("companyName")} placeholder="Enter company name" />
                    {errors.companyName && (
                      <p className="text-xs text-red-500">{errors.companyName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <Textarea {...register("address")} rows={2} />
                    {errors.address && (
                      <p className="text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Subject</Label>
                    <Input {...register("subject")} placeholder="e.g. Quotation for Wall Cabinet work" />
                    {errors.subject && (
                      <p className="text-xs text-red-500">{errors.subject.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
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
                          <Input
                            type="number"
                            {...register(`items.${index}.slNo`, { valueAsNumber: true })}
                            className="mt-1"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            {...register(`items.${index}.description`)}
                            rows={2}
                            className="mt-1"
                            placeholder="Item description"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Label className="text-xs">QTY</Label>
                          <Input
                            type="number"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="mt-1"
                            onChange={(e) => {
                              register(`items.${index}.quantity`).onChange(e);
                              updateAmount(index);
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Unit</Label>
                          <Input {...register(`items.${index}.unit`)} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Rate</Label>
                          <Input
                            type="number"
                            step="0.001"
                            {...register(`items.${index}.rate`, { valueAsNumber: true })}
                            className="mt-1"
                            onChange={(e) => {
                              register(`items.${index}.rate`).onChange(e);
                              updateAmount(index);
                            }}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Label className="text-xs">Amount</Label>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {formatCurrency(items[index]?.amount || 0, currency)}
                            </span>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        id: crypto.randomUUID(),
                        slNo: fields.length + 1,
                        description: "",
                        quantity: 1,
                        unit: "Nos",
                        rate: 0,
                        amount: 0,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>

                  <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalAmount, currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Textarea {...register("paymentTerms")} rows={4} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input {...register("bankName")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input {...register("accountNumber")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input {...register("accountName")} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Signature Name</Label>
                      <Input {...register("signatureName")} placeholder="e.g. ALI RAZA" />
                      {errors.signatureName && (
                        <p className="text-xs text-red-500">{errors.signatureName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <Input {...register("contactNumber")} placeholder="e.g. +968 92903653" />
                      {errors.contactNumber && (
                        <p className="text-xs text-red-500">{errors.contactNumber.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="submit" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Save Quotation
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={handleDownload} disabled={pdfLoading}>
                  <Download className="mr-2 h-5 w-5" />
                  {pdfLoading ? "Generating PDF..." : "Download PDF"}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500">Live Preview</CardTitle>
                      <Badge variant="outline">A4</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="scale-[0.55] origin-top-left p-8 w-[727px]">
                      {/* Simplified preview matching refined PDF design */}
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
                        <p>Date: {watch("date")}</p>
                      </div>

                      <div className="mb-2 text-sm">
                        <p>To</p>
                        <p>M/s {watch("companyName")}</p>
                        <p>{watch("address")}</p>
                      </div>

                      <h1 className="text-center text-lg font-bold underline mb-3 underline-offset-2">QUOTATION</h1>

                      <p className="text-sm font-bold underline mb-3 underline-offset-2">Sub: {watch("subject")}</p>

                      <p className="text-xs text-gray-700 mb-4">
                        We thank you for your invitation to quote for the subject work and pleased for submitting herewith our lowest quotation for the same as follows:
                      </p>

                      <p className="text-xs font-bold underline mb-2 underline-offset-2">Scope of work:</p>

                      <table className="w-full border-collapse text-xs mb-4 border border-black">
                        <thead>
                          <tr className="border-b border-black">
                            <th className="border-r border-black p-1.5 text-center w-10">SL.</th>
                            <th className="border-r border-black p-1.5 text-center">Descriptions</th>
                            <th className="border-r border-black p-1.5 text-center w-16">QTY</th>
                            <th className="border-r border-black p-1.5 text-center w-20">Rate In {currency}</th>
                            <th className="p-1.5 text-center w-24">Amount in {currency === "OMR" ? "Ro" : currency}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i} className="border-b border-black">
                              <td className="border-r border-black p-1.5 text-center">{item.slNo}</td>
                              <td className="border-r border-black p-1.5">{item.description}</td>
                              <td className="border-r border-black p-1.5 text-center">{item.quantity} {item.unit}</td>
                              <td className="border-r border-black p-1.5 text-right">{item.rate > 0 ? formatCurrency(item.rate, currency) : "L/S"}</td>
                              <td className="p-1.5 text-right">{formatCurrency(item.amount, currency)}</td>
                            </tr>
                          ))}
                          <tr className="font-bold border-t-2 border-black">
                            <td className="border-r border-black p-1.5" colSpan={3}></td>
                            <td className="border-r border-black p-1.5 text-right">Total Amount</td>
                            <td className="p-1.5 text-right">{formatCurrency(totalAmount, currency)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <p className="text-xs font-bold text-center border border-black py-1 px-2 mb-4 mx-auto inline-block w-full">
                        {numberToWords(totalAmount, currency)}
                      </p>

                      <div className="text-xs mb-4">
                        <p className="font-bold underline underline-offset-2 mb-1">Payment terms:</p>
                        {watch("paymentTerms")
                          .split("\n")
                          .map((t, i) => t.trim() && <p key={i} className="ml-2">&bull; {t.trim()}</p>)}
                      </div>

                      <div className="text-xs mb-6">
                        <p className="font-bold mb-1">Bank Details -</p>
                        <p><span className="font-bold">Bank Name</span> <span className="ml-4">: {watch("bankName")}</span></p>
                        <p><span className="font-bold">AC NO</span> <span className="ml-10">: {watch("accountNumber")}</span></p>
                        <p><span className="font-bold">Name</span> <span className="ml-11">: {watch("accountName")}</span></p>
                      </div>

                      <div className="text-xs">
                        <p>Yours Faithfully,</p>
                        <p>For, {company.name}</p>
                        <div className="h-8"></div>
                        <p className="font-bold">{watch("signatureName")}</p>
                        <p>GSM: {watch("contactNumber")}</p>
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
