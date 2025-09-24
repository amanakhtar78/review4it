"use client";

import * as React from "react";

type Currency = "inr" | "usd";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount?: number) => string;
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(
  undefined
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = React.useState<Currency>("inr");

  // Assumption: All incoming amounts are in INR Crores as per backend
  // USD conversion uses fixed rate: 1 USD = 87 INR (can be externalized later)
  const INR_PER_USD = 87;
  const RUPEE = "₹";

  const formatCurrency = (amountInCrore?: number): string => {
    // Coerce undefined/null/NaN to 0 so UI does not break
    const safe = Number.isFinite(Number(amountInCrore))
      ? Number(amountInCrore)
      : 0;

    if (currency === "inr") {
      // Show in Crore/Lakh using Indian numbering system
      if (safe >= 1) {
        return `${RUPEE}${safe.toFixed(2)} Cr`;
      }
      // 1 Cr = 100 Lakh
      const inLakh = safe * 100;
      if (inLakh >= 1) {
        return `${RUPEE}${inLakh.toFixed(2)} L`;
      }
      // Fallback for very small values
      const inRupees = safe * 10000000; // 1 Cr = 1,00,00,000
      return `${RUPEE}${Math.round(inRupees).toLocaleString("en-IN")}`;
    } else {
      // usd
      // Convert INR Crore -> INR -> USD
      const amountInINR = safe * 10000000; // to rupees
      const amountInUSD = amountInINR / INR_PER_USD;
      if (amountInUSD >= 1_000_000_000) {
        return `$${(amountInUSD / 1_000_000_000).toFixed(2)}B`;
      }
      if (amountInUSD >= 1_000_000) {
        return `$${(amountInUSD / 1_000_000).toFixed(2)}M`;
      }
      return `$${Math.round(amountInUSD).toLocaleString("en-US")}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = React.useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
