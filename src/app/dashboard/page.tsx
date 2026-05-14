"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Receipt,
  FolderOpen,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { useDocuments } from "@/hooks/use-documents";

export default function DashboardPage() {
  const { documents } = useDocuments();

  const totalQuotations = documents.filter((d) => d.type === "quotation").length;
  const totalInvoices = documents.filter((d) => d.type === "invoice").length;
  const totalRevenue = documents
    .filter((d) => d.type === "invoice")
    .reduce((sum, d) => sum + d.totalAmount, 0);
  const recentDocs = documents.slice(0, 5);

  const stats = [
    {
      title: "Total Quotations",
      value: totalQuotations,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Total Invoices",
      value: totalInvoices,
      icon: Receipt,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Total Revenue",
      value: `OMR ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 3 })}`,
      icon: TrendingUp,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
  ];

  const quickActions = [
    {
      title: "Create Quotation",
      description: "Generate a new professional quotation",
      icon: FileText,
      href: "/quotation",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Create Invoice",
      description: "Generate a new invoice",
      icon: Receipt,
      href: "/invoice",
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      title: "View Documents",
      description: "Manage all saved documents",
      icon: FolderOpen,
      href: "/documents",
      color: "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Overview of your quotations and invoices
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={action.href}>
                  <Card className="group cursor-pointer border-0 shadow-md transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-110 ${action.color}`}
                      >
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Documents
            </h2>
            <Link href="/documents">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300 bg-transparent dark:border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  No documents yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Create your first quotation or invoice to get started
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href="/quotation">
                    <Button>Create Quotation</Button>
                  </Link>
                  <Link href="/invoice">
                    <Button variant="outline">Create Invoice</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {recentDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white/60 dark:bg-gray-900/60">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {doc.type === "quotation" ? (
                          <FileText className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Receipt className="h-5 w-5 text-emerald-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {doc.type === "quotation" ? doc.quotationNumber : doc.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {doc.companyName} &middot;{" "}
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          OMR {doc.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 3 })}
                        </span>
                        {doc.type === "invoice" && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              doc.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : doc.paymentStatus === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {doc.paymentStatus}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
