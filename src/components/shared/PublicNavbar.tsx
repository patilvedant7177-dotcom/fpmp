"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PublicNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-2 md:px-12">
        <div className="flex items-center gap-4 lg:gap-8 lg:ml-4">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 shrink-0">
            <Image 
              src="/institute-logo.png" 
              alt="Fr. CRCE Logo" 
              width={240} 
              height={64} 
              className="h-10 w-auto object-contain md:h-14 lg:h-16"
              priority
            />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/5"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 lg:flex">
          <Link 
            href={pathname.startsWith("/faculty/") ? "/directory" : (pathname === "/" ? "/directory" : "/")} 
            className="flex items-center gap-1 text-[13px] font-bold text-primary hover:opacity-80 transition-opacity"
          >
            {pathname !== "/" && (
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            )}
            {pathname === "/" ? "Public Directory" : (pathname.startsWith("/faculty/") ? "Back to Directory" : "Back to Home")}
          </Link>
          
          <Link 
            href="/inquiry" 
            className="flex items-center gap-2 rounded-md border border-primary/20 px-4 py-2.5 text-[12px] font-bold text-primary transition-all hover:bg-primary/5 active:scale-95 shine-button"
          >
            Track Inquiry
          </Link>

          {user ? (
            <Link 
              href={role === 'admin' ? "/admin/dashboard" : "/faculty/dashboard"} 
              className="hero-gradient rounded-md px-6 py-2.5 text-[12px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="hero-gradient rounded-md px-6 py-2.5 text-[12px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[64px] z-40 bg-surface/95 backdrop-blur-xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-2 p-6">
            <Link 
              href={pathname.startsWith("/faculty/") ? "/directory" : (pathname === "/" ? "/directory" : "/")} 
              className="flex items-center gap-4 rounded-xl p-4 text-base font-bold text-primary transition-colors hover:bg-primary/5 active:bg-primary/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                <span className="material-symbols-outlined">
                  {pathname === "/" ? "person_search" : "arrow_back"}
                </span>
              </div>
              <span>{pathname === "/" ? "Public Directory" : (pathname.startsWith("/faculty/") ? "Back to Directory" : "Back to Home")}</span>
            </Link>
            
            <Link 
              href="/inquiry" 
              className="flex items-center gap-4 rounded-xl p-4 text-base font-bold text-primary transition-colors hover:bg-primary/5 active:bg-primary/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                <span className="material-symbols-outlined">search_check</span>
              </div>
              <span>Track Inquiry</span>
            </Link>

            <div className="my-4 h-px w-full bg-outline-variant/20" />

            {user ? (
              <Link 
                href={role === 'admin' ? "/admin/dashboard" : "/faculty/dashboard"} 
                className="hero-gradient flex items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-on-primary shadow-lg shadow-primary/20"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="hero-gradient flex items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-on-primary shadow-lg shadow-primary/20"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined">login</span>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
