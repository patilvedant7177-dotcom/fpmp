import Link from "next/link";

export default function PublicNavbar() {
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
          <Link href="/directory" className="hero-gradient rounded-md px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-lg shadow-blue-900/10 transition-all duration-200 hover:scale-95">
            Public Directory
          </Link>
        </div>
      </div>
    </nav>
  );
}
