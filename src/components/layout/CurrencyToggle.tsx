"use client";

import * as React from "react";
import { useCurrency } from "@/context/CurrencyContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
            {currency === 'inr' ? '₹' : '$'}
            <span className="sr-only">Toggle currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setCurrency("inr")}>
          ₹ INR
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("usd")}>
          $ USD
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
