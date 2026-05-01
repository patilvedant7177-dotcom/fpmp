import Link from "next/link";
import { Search, ArrowLeft, AlertCircle } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";

export default function InquiryNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest">
      <PublicNavbar />
      
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-48 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-error/10 text-error mb-8 animate-in zoom-in-95">
          <AlertCircle size={48} />
        </div>
        
        <h1 className="font-headline text-[32px] font-black tracking-tight text-primary mb-4">
          Inquiry Not Found
        </h1>
        
        <p className="font-body text-[16px] text-on-surface-variant mb-12 max-w-md mx-auto">
          We couldn't find an inquiry with that ID. Please double-check your Tracking ID and try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/inquiry" 
            className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-2xl font-headline text-[15px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Search size={18} />
            Try another ID
          </Link>
          
          <Link 
            href="/directory" 
            className="flex items-center gap-2 bg-surface-container-high text-on-surface px-8 py-3 rounded-2xl font-headline text-[15px] font-bold hover:bg-surface-container-highest transition-all w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            Back to Directory
          </Link>
        </div>

        <p className="mt-16 font-label text-[10px] uppercase tracking-widest text-outline">
          Tracking IDs are unique and case-sensitive.
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
