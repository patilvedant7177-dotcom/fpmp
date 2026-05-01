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
              className="h-12 w-auto object-contain md:h-16 lg:h-20"
              priority
            />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-primary"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-4 md:flex">
          <Link 
            href={pathname.startsWith("/faculty/") ? "/directory" : (pathname === "/" ? "/directory" : "/")} 
            className="flex items-center gap-1 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            {pathname !== "/" && (
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            )}
            {pathname === "/" ? "Public Directory" : (pathname.startsWith("/faculty/") ? "Back to Directory" : "Back to Home")}
          </Link>
          
          <Link 
            href="/inquiry" 
            className="hidden sm:flex items-center gap-2 rounded-md border border-primary/20 px-4 py-2.5 text-[13px] font-bold text-primary transition-all hover:bg-primary/5 active:scale-95 shine-button"
          >
            Track Inquiry
          </Link>

          {user ? (
            <Link 
              href={role === 'admin' ? "/admin/dashboard" : "/faculty/dashboard"} 
              className="hero-gradient rounded-md px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="hero-gradient rounded-md px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-outline-variant/10 bg-surface px-4 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <Link 
              href={pathname.startsWith("/faculty/") ? "/directory" : (pathname === "/" ? "/directory" : "/")} 
              className="flex items-center gap-3 text-sm font-bold text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {pathname === "/" ? "person_search" : "arrow_back"}
              </span>
              {pathname === "/" ? "Public Directory" : (pathname.startsWith("/faculty/") ? "Back to Directory" : "Back to Home")}
            </Link>
            
            <Link 
              href="/inquiry" 
              className="flex items-center gap-3 text-sm font-bold text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">search_check</span>
              Track Inquiry
            </Link>

            <div className="mt-2 h-px w-full bg-outline-variant/20" />

            {user ? (
              <Link 
                href={role === 'admin' ? "/admin/dashboard" : "/faculty/dashboard"} 
                className="hero-gradient flex items-center justify-center rounded-md py-3 text-sm font-bold text-on-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="hero-gradient flex items-center justify-center rounded-md py-3 text-sm font-bold text-on-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
