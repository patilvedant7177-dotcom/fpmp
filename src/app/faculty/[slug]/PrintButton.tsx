"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-headline text-[13px] font-bold text-on-primary shadow-lg transition-all hover:scale-105 active:scale-95"
    >
      <Printer size={18} />
      Export PDF
    </button>
  );
}
