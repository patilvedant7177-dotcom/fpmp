import { createSupabaseServerClient } from "@/lib/supabase-server";
import PublicNavbar from "@/components/shared/PublicNavbar";
import DirectoryClient from "./DirectoryClient";
import Link from "next/link";

export default async function DirectoryPage() {
  const supabase = await createSupabaseServerClient();

  const { data: faculty } = await supabase
    .from("faculty_profiles")
    .select(
      "id, slug, name, designation, department, keywords, status, completion, views, avatar_url"
    )
    .eq("status", "approved")
    .order("name");

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      {/* NAVBAR */}
      <PublicNavbar />

      {/* RENDER CLIENT COMPONENT */}
      <DirectoryClient facultyData={faculty ?? []} />

      {/* FOOTER */}
      <footer className="mt-auto w-full bg-slate-100/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between border-t border-outline-variant/20 px-6 py-6 md:flex-row md:px-12">
          <div className="font-label text-[10px] uppercase tracking-wide text-slate-500">
            © 2026 FPMP - FR. CONCEICAO RODRIGUES COLLEGE OF ENGINEERING
          </div>
          <div className="mt-4 flex gap-8 md:mt-0">
            <Link
              className="nav-link font-label text-[10px] uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-600"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="nav-link font-label text-[10px] uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-600"
              href="/terms"
            >
              Terms of Service
            </Link>
            <Link
              className="nav-link font-label text-[10px] uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-600"
              href="/contact"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
