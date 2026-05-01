"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import { 
  Search, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  HelpCircle 
} from "lucide-react";

export default function InquirySearchPage() {
  const [ticketId, setTicketId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let id = ticketId.trim();
    
    // Auto-extract ID if user pastes a full URL
    if (id.includes("/inquiry/")) {
      id = id.split("/inquiry/").pop() || id;
    }

    if (id) {
      router.push(`/inquiry/${id}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest">
      <PublicNavbar />
      
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-20 pt-40">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 mb-6">
            <ShieldCheck size={16} className="text-primary" />
            <span className="font-label text-[11px] font-black uppercase tracking-widest text-primary">
              Secure Tracking Portal
            </span>
          </div>
          <h1 className="font-headline text-[40px] md:text-[56px] font-black tracking-tight text-primary leading-[1.1] mb-6">
            Track your Inquiry
          </h1>
          <p className="font-body text-[18px] text-on-surface-variant max-w-2xl mx-auto">
            Enter your unique Tracking ID below to check the status of your message and view faculty responses.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleSearch}
            className="relative group mb-12"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-[32px] blur-2xl group-focus-within:bg-primary/10 transition-all" />
            <div className="relative flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-[32px] border border-outline-variant/30 shadow-xl shadow-primary/5">
              <div className="flex-1 flex items-center gap-4 px-6 w-full">
                <Search className="text-outline group-focus-within:text-primary transition-colors" size={24} />
                <input 
                  type="text" 
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Paste Tracking ID or Full Link..."
                  className="flex-1 py-4 bg-transparent font-headline text-[18px] font-bold text-primary outline-none placeholder:text-outline/50 placeholder:font-medium"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary px-10 py-4 rounded-2xl font-headline text-[16px] font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                Track Now
                <ArrowRight size={20} />
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-surface border border-outline-variant/20 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-headline text-[18px] font-bold mb-2">Pasting the link?</h3>
              <p className="font-body text-[14px] text-on-surface-variant leading-relaxed">
                You can paste the <b>entire link</b> you copied earlier. The portal will automatically find your ID and show you the reply.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface border border-outline-variant/20 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all">
                <HelpCircle size={24} />
              </div>
              <h3 className="font-headline text-[18px] font-bold mb-2">Need Help?</h3>
              <p className="font-body text-[14px] text-on-surface-variant leading-relaxed">
                If you've lost your ID, you may need to resubmit your inquiry or contact the department administration directly.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
