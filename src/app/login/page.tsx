"use client";

import Link from "next/link";
import { User, ShieldCheck, ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body relative overflow-hidden">
      <PublicNavbar />

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#00346f 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 z-10">
        <div className="w-full max-w-[800px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex flex-col items-center mb-12 text-center">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-4">
              Access Your Portal
            </h1>
            <p className="text-lg text-secondary max-w-md">
              Choose the appropriate portal to continue to your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Faculty Option */}
            <Link 
              href="/login/faculty"
              className="group relative flex flex-col items-center text-center p-10 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl shadow-black/5 transition-all hover:scale-[1.02] hover:border-primary/50"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <User size={40} />
              </div>
              <h2 className="font-headline text-2xl font-bold text-primary mb-3">
                Faculty Portal
              </h2>
              <p className="text-secondary text-sm leading-relaxed mb-8">
                Manage your academic profile, publications, and institutional records.
              </p>
              <div className="flex items-center gap-2 font-headline text-sm font-bold text-primary">
                Faculty Sign In <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Admin Option */}
            <Link 
              href="/login/admin"
              className="group relative flex flex-col items-center text-center p-10 rounded-2xl border border-outline-variant/30 bg-slate-900 shadow-xl shadow-black/5 transition-all hover:scale-[1.02] hover:border-blue-400/50"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-slate-900">
                <ShieldCheck size={40} />
              </div>
              <h2 className="font-headline text-2xl font-bold text-white mb-3">
                Admin Portal
              </h2>
              <p className="text-blue-100/70 text-sm leading-relaxed mb-8">
                Oversee institution data, approve profiles, and manage system settings.
              </p>
              <div className="flex items-center gap-2 font-headline text-sm font-bold text-white">
                Admin Sign In <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>


        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
