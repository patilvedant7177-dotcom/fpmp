"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart2,
  MessageSquare,
  ScrollText,
  Menu,
  X,
  Globe,
  Shield,
  User,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login/admin");
  };

  useEffect(() => {
    async function checkAuth() {
      setIsCheckingAuth(true);
      // 1. Quick session check
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // 2. Final verification
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (!verifiedUser || verifiedUser.user_metadata?.role !== 'admin') {
          router.push("/login/admin");
          return;
        }
      }

      const user = session?.user || (await supabase.auth.getUser()).data.user;
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push("/login/admin");
        return;
      }

      setIsCheckingAuth(false);

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
        router.push("/login/admin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

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
  ];

  const portalItems = [
    { name: "Public Directory", href: "/directory", icon: Globe },
    { name: "Faculty Portal", href: "/login/faculty", icon: User },
    { name: "Admin Portal", href: "/admin/dashboard", icon: Shield },
  ];

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-headline text-sm font-bold text-primary">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

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
          <Link href="/" className="transition-transform hover:scale-105">
            <Image 
              src="/institute-logo.png" 
              alt="Fr. CRCE Logo" 
              width={160} 
              height={42} 
              className="h-10 w-auto object-contain"
            />
          </Link>
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

        <div className="px-3 pb-2 pt-4 border-t border-slate-100">
          <div className="px-3 pb-2 font-label text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Portals
          </div>
          <nav className="flex flex-col gap-1">
            {portalItems.map((item) => {
              const isActive = pathname === item.href || (item.name === "Admin Portal" && pathname.startsWith("/admin"));
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
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR (White background to show exact logo) */}
        <header className="flex h-[72px] shrink-0 items-center justify-between bg-white border-b border-slate-200 px-2 shadow-sm md:px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-500 hover:text-slate-900 md:hidden"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/"
              className="hidden transition-transform hover:scale-105 md:block"
            >
              <Image 
                src="/institute-logo.png" 
                alt="Fr. CRCE Logo" 
                width={240} 
                height={64} 
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="hidden flex-1 md:block" />

          <div className="flex items-center gap-3">
            <span className="hidden font-label text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
              Admin Portal
            </span>
            <div
              onClick={handleLogout}
              className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-headline text-[12px] font-bold text-slate-600 transition-transform hover:scale-105 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              title="Sign Out"
            >
              <LogOut size={16} />
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
