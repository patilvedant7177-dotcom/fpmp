"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart2,
  MessageSquare,
  ScrollText,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    async function checkAuth() {
      // 1. Quick session check
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 2. Final verification
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (!verifiedUser || verifiedUser.user_metadata?.role !== 'admin') {
          window.location.href = "/login/admin";
          return;
        }
      }

      const user = session?.user || (await supabase.auth.getUser()).data.user;
      if (!user || user.user_metadata?.role !== 'admin') {
        window.location.href = "/login/admin";
        return;
      }

      const { count } = await supabase
        .from('faculty_profiles')
        .select('*', { count: 'exact', head: true })
        .in('profile_status', ['pending_review', 'revision', 'pending']);

      setPendingCount(count && count > 0 ? count : null);
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session || session.user.user_metadata?.role !== 'admin') {
        window.location.href = "/login/admin";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Faculty", href: "/admin/faculty", icon: Users },
    {
      name: "Reviews",
      href: "/admin/approval",
      icon: CheckSquare,
      badge: pendingCount,
    },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { name: "Messaging", href: "/admin/messaging", icon: MessageSquare },
    { name: "Audit Log", href: "/admin/audit", icon: ScrollText },
    { name: "Back to Directory", href: "/directory", icon: ArrowLeft },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-body text-slate-900">
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 md:static md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 px-3 md:hidden">
          <span className="font-headline text-lg font-bold tracking-tighter text-slate-900">
            FP<span className="text-primary">M</span>P
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-500 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 pb-2 pt-4">
          <div className="px-3 pb-2 font-label text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Admin Portal
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors ${isActive
                      ? "bg-primary-container font-medium text-on-primary-container"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={18}
                      className={`transition-opacity ${isActive
                          ? "text-primary opacity-100"
                          : "opacity-60 group-hover:text-slate-900 group-hover:opacity-100"
                        }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 font-label text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR (Strict dark logic for admin distinction) */}
        <header className="flex h-[52px] shrink-0 items-center justify-between bg-slate-950 px-4 shadow-sm md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-400 hover:text-white md:hidden"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/"
              className="hidden font-headline text-[18px] font-bold tracking-tighter text-white md:block"
            >
              FP<span className="text-primary">M</span>P
            </Link>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-1 py-1 shadow-inner md:flex">
            <Link
              href="/directory"
              className="rounded-full px-4 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-white"
            >
              Public Directory
            </Link>
            <Link
              href="/login/faculty"
              className="rounded-full px-4 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-white"
            >
              Faculty Portal
            </Link>
            <div className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-sm">
              Admin Portal
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-label text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
              Admin Portal
            </span>
            <div className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-800 font-headline text-[12px] font-bold text-white transition-transform hover:scale-105">
              AD
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
