"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  Upload,
  MessageSquare,
  Menu,
  X,
  Globe,
  Shield,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FacultyLayoutProps {
  children: ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("Faculty");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login/faculty");
  };

  useEffect(() => {
    async function checkAuth() {
      setIsCheckingAuth(true);
      // 1. Quick session check
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // 2. Final verification if session is null
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (!verifiedUser) {
          router.push("/login/faculty");
          return;
        }
      }

      const user = session?.user || (await supabase.auth.getUser()).data.user;
      if (!user) {
        router.push("/login/faculty");
        return;
      }

      setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "Faculty");

      // Check role
      if (user.user_metadata?.role && user.user_metadata.role !== 'faculty' && user.user_metadata.role !== 'admin') {
        router.push("/login/faculty");
        return;
      }

      setIsCheckingAuth(false);

      // Load profile and unread messages
      const { data: profile } = await supabase
        .from('faculty_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;

      const profileId = profile.id;
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .or(`to_faculty.eq.${profileId},to_faculty.is.null`)
        .order('sent_at', { ascending: false });

      if (messages) {
        let readIds: string[] = [];
        try {
          const stored = localStorage.getItem("fpmp_read_messages");
          if (stored) readIds = JSON.parse(stored);
        } catch { }

        const unread = messages.filter(m => !readIds.includes(m.id)).length;
        setUnreadCount(unread > 0 ? unread : null);
      }
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push("/login/faculty");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const navItems = [
    { name: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
    { name: "Edit Profile", href: "/faculty/editor", icon: PenLine },
    { name: "CV Upload & AI", href: "/faculty/cv-upload", icon: Upload },
    {
      name: "Messages",
      href: "/faculty/messages",
      icon: MessageSquare,
      badge: unreadCount,
    },
    { name: "Settings", href: "/faculty/settings", icon: Settings },
  ];

  const portalItems = [
    { name: "Public Directory", href: "/directory", icon: Globe },
    { name: "Faculty Portal", href: "/faculty/dashboard", icon: User },
    { name: "Admin Portal", href: "/login/admin", icon: Shield },
  ];

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="font-headline text-sm font-bold text-primary">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface font-body text-on-surface">
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-outline-variant/30 bg-surface-container-lowest transition-transform duration-300 md:static md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
            className="text-secondary hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 pb-2 pt-4">
          <div className="px-3 pb-2 font-label text-[10px] font-bold uppercase tracking-wider text-outline">
            Faculty Portal
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
                  className={`group shine-button flex items-center justify-between rounded-lg px-3 py-2 text-[15px] transition-all ${isActive
                      ? "bg-primary-container font-medium text-on-primary-container"
                      : "text-secondary hover:bg-surface-container-low hover:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={18}
                      className={`transition-opacity ${isActive ? "text-primary opacity-100" : "opacity-60 group-hover:opacity-100 group-hover:text-primary"
                        }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 font-label text-[10px] font-bold text-on-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 pb-2 pt-4 border-t border-outline-variant/10">
          <div className="px-3 pb-2 font-label text-[10px] font-bold uppercase tracking-wider text-outline">
            System Portals
          </div>
          <nav className="flex flex-col gap-1">
            {portalItems.map((item) => {
              const isActive = pathname === item.href || (item.name === "Faculty Portal" && pathname.startsWith("/faculty"));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group shine-button flex items-center justify-between rounded-lg px-3 py-2 text-[15px] transition-all ${isActive
                      ? "bg-primary-container font-medium text-on-primary-container"
                      : "text-secondary hover:bg-surface-container-low hover:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={18}
                      className={`transition-opacity ${isActive ? "text-primary opacity-100" : "opacity-60 group-hover:opacity-100 group-hover:text-primary"
                        }`}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-outline-variant/20 p-3">
          <button
            onClick={handleLogout}
            className="shine-button flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="glass-nav flex h-[72px] shrink-0 items-center justify-between border-b border-outline-variant/20 px-2 md:px-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-secondary hover:text-primary md:hidden"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/"
              className="transition-transform hover:scale-105 hidden md:block"
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
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-label text-[10px] font-bold uppercase tracking-wider text-outline">
                Faculty Portal
              </span>
              <span className="font-body text-[11px] font-medium text-secondary truncate max-w-[120px]">
                {userName}
              </span>
            </div>
            <Link
              href="/faculty/settings"
              className="shine-button flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-surface-container-highest border border-outline-variant/30 font-headline text-[12px] font-bold text-primary transition-all hover:scale-105 hover:bg-primary-container"
              title="Settings"
            >
              <Settings size={16} />
            </Link>
            <div
              onClick={handleLogout}
              className="shine-button flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-surface-container-highest border border-outline-variant/30 font-headline text-[12px] font-bold text-primary transition-all hover:scale-105 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              title="Sign Out"
            >
              <LogOut size={16} />
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto bg-surface-container-low">
          {children}
        </main>
      </div>
    </div>
  );
}
