"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.role === 'admin') {
        router.push("/admin/dashboard");
      }
    }
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = data.user;
      const role = user?.user_metadata?.role;

      if (role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        await supabase.auth.signOut();
        setError('Not authorised as admin');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 font-body relative overflow-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] -translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* FLOATING GRID BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      {/* QUICK BACK NAVIGATION */}
      <Link href="/" className="absolute top-8 left-8 z-30 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md">
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
        Back to Home
      </Link>

      <div className="z-10 w-full max-w-[420px] px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* LOGO BLOCK */}
        <div className="flex flex-col items-center mb-8 text-center reveal reveal-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            Admin Auth
          </h1>
          <p className="mt-2 text-[14px] text-slate-400">
            Enterprise Management Gateway
          </p>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl reveal reveal-2">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 font-label">
                Institutional Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" size={18} />
                <input 
                  type="email" 
                  autoComplete="email"
                  required
                  placeholder="admin@institution.edu"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-3 pl-10 pr-4 text-[14px] text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-body"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 font-label">
                Password
              </label>
              <div className="relative group">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" size={18} />
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/50 py-3 pl-10 pr-4 text-[14px] text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-body tracking-[0.2em]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-500 font-medium">{error}</p>
            )}

            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500" />
                Remember this device
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-headline text-[14px] font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
                {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Initiate Secure Session <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

        </div>
        
        {/* FOOTER */}
        <div className="mt-8 text-center text-[11px] font-medium text-slate-500 reveal reveal-3">
          <p className="flex items-center justify-center gap-1.5 opacity-60">
            <Lock size={12} /> Powered by AES-256 Encryption
          </p>
        </div>

      </div>
    </div>
  );
}
