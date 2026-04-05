"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  Upload,
  MessageSquare,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

interface FacultyLayoutProps {
  children: ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
    { name: "Edit Profile", href: "/faculty/editor", icon: PenLine },
    { name: "CV Upload & AI", href: "/faculty/cv-upload", icon: Upload },
    {
      name: "Messages",
      href: "/faculty/messages",
      icon: MessageSquare,
      badge: 2,
    },
    { name: "Back to Directory", href: "/directory", icon: ArrowLeft },
  ];

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-outline-variant/30 bg-surface-container-lowest transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 px-3 md:hidden">
          <span className="font-headline text-lg font-bold tracking-tighter text-blue-950">
            FP<span className="text-primary">M</span>P
          </span>
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
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors ${
                    isActive
                      ? "bg-primary-container font-medium text-on-primary-container"
                      : "text-secondary hover:bg-surface-container-low hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={18}
                      className={`transition-opacity ${
                        isActive ? "text-primary opacity-100" : "opacity-60 group-hover:opacity-100 group-hover:text-primary"
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
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="glass-nav flex h-[52px] shrink-0 items-center justify-between border-b border-outline-variant/20 px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-secondary hover:text-primary md:hidden"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/"
              className="font-headline text-[18px] font-bold tracking-tighter text-blue-950 hidden md:block"
            >
              FP<span className="text-primary">M</span>P
            </Link>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-1 py-1 shadow-sm md:flex">
            <Link
              href="/directory"
              className="rounded-full px-4 py-1 text-xs font-medium text-secondary transition-colors hover:bg-surface-container hover:text-primary"
            >
              Public Directory
            </Link>
            <div className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-on-primary shadow-sm">
              Faculty Portal
            </div>
            <Link
              href="/login/admin"
              className="rounded-full px-4 py-1 text-xs font-medium text-secondary transition-colors hover:bg-surface-container hover:text-primary"
            >
              Admin Portal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-label text-[11px] font-semibold uppercase tracking-wider text-outline sm:block">
              Faculty Portal
            </span>
            <div className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-surface-container-highest border border-outline-variant/30 font-headline text-[12px] font-bold text-primary transition-transform hover:scale-105">
              SM
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
