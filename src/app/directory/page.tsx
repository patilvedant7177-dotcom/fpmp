import { createSupabaseServerClient } from "@/lib/supabase-server";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
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

      <PublicFooter />
    </div>
  );
}
