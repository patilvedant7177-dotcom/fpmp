"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, KeyRound, ArrowRight, BookOpenCheck } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import { supabase } from "@/lib/supabase";

export default function FacultyLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/faculty/dashboard");
      }
    }
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = data.user;
      const role = user?.user_metadata?.role;

      if (role === 'faculty') {
        router.push("/faculty/dashboard");
      } else if (role === 'admin') {
        setError('Use the Admin portal to log in');
        setIsSubmitting(false);
      } else {
        // Fallback for missing role if needed
        router.push("/faculty/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email to reset password");
      return;
    }
    
    setError(null);
    setMessage(null);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/reset-password',
      });

      if (resetError) throw resetError;
      setMessage("Reset link sent to your email");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body relative overflow-hidden">
      <PublicNavbar />

      {/* QUICK BACK NAVIGATION */}
      <div className="absolute top-20 left-8 z-20">
        <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary">
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          Back to Home
        </Link>
      </div>

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#00346f 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 z-10">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex flex-col items-center mb-8 text-center reveal reveal-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white mb-5 shadow-lg shadow-primary/20">
              <BookOpenCheck size={28} />
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
              Faculty Portal
            </h1>
            <p className="mt-2 text-[15px] text-secondary">
              Sign in to manage your academic profile
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-xl shadow-black/5 reveal reveal-2">
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold uppercase tracking-wider text-outline font-label">
                  University Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="firstname.lastname@institution.edu"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 pl-10 text-[14px] text-primary placeholder-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-body shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-outline font-label">
                    Password
                  </label>
                  <a 
                    href="#" 
                    onClick={handleForgotPassword}
                    className="text-[12px] font-bold text-primary hover:text-blue-700 transition-colors"
                  >
                    Forgot details?
                  </a>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 pl-10 text-[14px] text-primary placeholder-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-body tracking-[0.2em] shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {(error || message) && (
                <div className="flex flex-col gap-1">
                  {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
                  {message && <p className="text-[12px] text-green-600 font-medium">{message}</p>}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-headline text-[15px] font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Dashboard <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-[13px] text-secondary border-t border-outline-variant/30 pt-6">
              Don't have an account?{" "}
              <a href="#" className="font-bold text-primary hover:underline">
                Request access.
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}