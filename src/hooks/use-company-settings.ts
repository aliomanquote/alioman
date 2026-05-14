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
          setSettings({ ...defaultCompanySettings, ...JSON.parse(stored) });
        }
      } catch {
        console.warn("Error loading company settings");
      }
    }
  }, []);

  return settings;
}
