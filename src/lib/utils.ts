import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "OMR"): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

export function numberToWords(num: number, currency: string = "Omani Rials"): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    }
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "");
  }

  if (num === 0) return "Zero";

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 1000);

  let result = "";
  if (whole >= 1000000) {
    result += convertLessThanOneThousand(Math.floor(whole / 1000000)) + " Million ";
  }
  if (whole >= 1000) {
    result += convertLessThanOneThousand(Math.floor((whole % 1000000) / 1000)) + " Thousand ";
  }
  result += convertLessThanOneThousand(whole % 1000);

  let words = result.trim() + " " + currency;
  if (decimal > 0) {
    words += " and " + decimal + "/1000";
  }
  words += " Only";

  return words;
}

export function toArabicNumerals(num: string): string {
  const map: Record<string, string> = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
  };
  return num.split("").map((c) => map[c] || c).join("");
}

export function generateDocumentNumber(prefix: string, existingNumbers: string[]): string {
  const maxNum = existingNumbers
    .map((n) => parseInt(n.split("-")[2] || "0"))
    .filter((n) => !isNaN(n));
  const nextNum = maxNum.length > 0 ? Math.max(...maxNum) + 1 : 1;
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(nextNum).padStart(4, "0")}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
