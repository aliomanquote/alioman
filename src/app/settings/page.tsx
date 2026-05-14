"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Building2, Phone, Mail, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompanySettings, defaultCompanySettings } from "@/types";

const STORAGE_KEY = "quotex-company-settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch {
          // ignore parse errors
        }
      }
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateField = (field: keyof CompanySettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Company Settings
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Customize your company letterhead and contact details
            </p>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400"
          >
            Settings saved successfully!
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-red-600" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name (English)</Label>
                <Input
                  value={settings.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name (Arabic)</Label>
                <Input
                  value={settings.arabicName}
                  onChange={(e) => updateField("arabicName", e.target.value)}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo Text</Label>
                <Input
                  value={settings.logoText}
                  onChange={(e) => updateField("logoText", e.target.value)}
                  placeholder="e.g. ADB"
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline / Full Name</Label>
                <Input
                  value={settings.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-red-600" />
                Address & Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>C.R Number</Label>
                <Input
                  value={settings.crNumber}
                  onChange={(e) => updateField("crNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>P.O. Box</Label>
                <Input
                  value={settings.poBox}
                  onChange={(e) => updateField("poBox", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  value={settings.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={settings.country}
                  onChange={(e) => updateField("country", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-red-600" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-red-600" />
                Default Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  value={settings.bankName}
                  onChange={(e) => updateField("bankName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={settings.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Account Name</Label>
                <Input
                  value={settings.accountName}
                  onChange={(e) => updateField("accountName", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
