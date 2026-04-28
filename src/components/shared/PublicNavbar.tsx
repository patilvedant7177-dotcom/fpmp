"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PublicNavbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      // 1. Quick session check (instant)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'faculty');
      } else {
        // 2. Fallback check (slower)
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (verifiedUser) {
          setUser(verifiedUser);
          setRole(verifiedUser.user_metadata?.role || 'faculty');
        } else {
          setUser(null);
          setRole(null);
        }
      }
    }

    checkUser();

    // Listen for auth changes to update navbar instantly
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || 'faculty');
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full glass-nav border-b border-outline-variant/20 font-headline tracking-tight shadow-sm antialiased">
      <div className="mx-auto flex max-w-full items-center justify-between px-6 py-3 md:px-12">
        <div className="flex items-center gap-8 lg:ml-12">
          <Link href="/" className="text-xl font-bold tracking-tighter text-blue-950">
            FP<span className="text-primary">M</span>P
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link className="nav-link text-sm font-medium text-slate-500 transition-colors hover:text-blue-900" href="/departments">
              Departments
            </Link>
            <Link className="nav-link text-sm font-medium text-slate-500 transition-colors hover:text-blue-900" href="/about">
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/directory" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">
            Public Directory
          </Link>
          
          {user ? (
            <Link 
              href={role === 'admin' ? "/admin/dashboard" : "/faculty/dashboard"} 
              className="hero-gradient rounded-md px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/login/faculty" 
              className="hero-gradient rounded-md px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95"
            >
              Faculty Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
