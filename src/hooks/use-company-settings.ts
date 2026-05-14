"use client";

import { useState, useEffect } from "react";
import { CompanySettings, defaultCompanySettings } from "@/types";

const STORAGE_KEY = "quotex-company-settings";

export function useCompanySettings(): CompanySettings {
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({
            ...defaultCompanySettings,
            bankName: parsed.bankName || defaultCompanySettings.bankName,
            accountNumber: parsed.accountNumber || defaultCompanySettings.accountNumber,
            accountName: parsed.accountName || defaultCompanySettings.accountName,
            phone: parsed.phone || defaultCompanySettings.phone,
            email: parsed.email || defaultCompanySettings.email,
          });
        }
      } catch {
        console.warn("Error loading company settings");
      }
    }
  }, []);

  return settings;
}
