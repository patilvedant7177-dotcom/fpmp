"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  RotateCcw,
  X as CloseIcon,
  Check,
  User,
  BookOpen,
  Tag,
  Trophy,
  GraduationCap,
  Award,
  Mic,
} from "lucide-react";

/** Last published profile shape for diff left panel; updated on each approve. Add `approved_snapshot jsonb` to faculty_profiles if missing. */
type Snapshot = {
  about?: string | null;
  keywords?: string[] | null;
  name?: string | null;
  designation?: string | null;
  department?: string | null;
  experience?: string | null;
  email?: string | null;
  phone?: string | null;
  note_to_admin?: string | null;
  admin_feedback?: string | null;
  memberships?: string[] | null;
  education?: unknown[] | null;
  publications?: unknown[] | null;
  projects?: unknown[] | null;
  awards?: unknown[] | null;
  certifications?: unknown[] | null;
  invited_talks?: unknown[] | null;
};

type ProfileRow = Snapshot & {
  id: string;
  status?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  approved_snapshot?: Snapshot | null;
  education?: any[];
  publications?: any[];
  projects?: any[];
  awards?: any[];
  certifications?: any[];
  invited_talks?: any[];
  memberships?: string[];
};

function buildApprovedSnapshot(p: ProfileRow): Snapshot {
  const {
    education = [],
    publications = [],
    projects = [],
    awards = [],
    certifications = [],
    invited_talks = [],
  } = p;
  const strip = (rows: any[]) =>
    rows.map((row) => {
      const { id: _id, created_at: _c, faculty_id: _f, ...rest } = row || {};
      return rest;
    });
  return {
    about: p.about ?? null,
    keywords: p.keywords ?? null,
    name: p.name ?? null,
    designation: p.designation ?? null,
    department: p.department ?? null,
    experience: p.experience ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    memberships: p.memberships ?? null,
    education: strip(education || []),
    publications: strip(publications || []),
    projects: strip(projects || []),
    awards: strip(awards || []),
    certifications: strip(certifications || []),
    invited_talks: strip(invited_talks || []),
  };
}

function sectionModified(prev: unknown, curr: unknown): boolean {
  return JSON.stringify(prev ?? null) !== JSON.stringify(curr ?? null);
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ProfileApprovalPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [adminNotes, setAdminNotes] = useState("");

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionModalError, setRevisionModalError] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from("faculty_profiles")
        .select(
          `*, education(*), publications(*), awards(*), certifications(*), invited_talks(*)`,
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setLoadError("Profile not found.");
        setProfile(null);
        return;
      }
      setProfile(data as ProfileRow);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const previous = (profile?.approved_snapshot as Snapshot | null | undefined) ?? null;
  const current = profile;
  const prevAbout = previous?.about ?? "";
  const currAbout = current?.about ?? "";
  const prevKw = previous?.keywords ?? [];
  const currKw = current?.keywords ?? [];
  const prevPub = previous?.publications ?? [];
  const currPub = current?.publications ?? [];
  const prevAwards = previous?.awards ?? [];
  const currAwards = current?.awards ?? [];
  const prevEdu = previous?.education ?? [];
  const currEdu = current?.education ?? [];
  const prevCert = previous?.certifications ?? [];
  const currCert = current?.certifications ?? [];
  const prevTalks = previous?.invited_talks ?? [];
  const currTalks = current?.invited_talks ?? [];

  const handleApprove = async () => {
    if (!profile?.id) return;
    setBusy(true);
    try {
      const snapshot = buildApprovedSnapshot(profile);
      const { error: uErr } = await supabase
        .from("faculty_profiles")
        .update({
          status: "approved",
          profile_status: "reviewed",
          approved_snapshot: snapshot,
        } as never)
        .eq("id", profile.id);
      if (uErr) {
        if (uErr.message?.includes("approved_snapshot") || uErr.code === "42703") {
          const { error: u2 } = await supabase
            .from("faculty_profiles")
            .update({ status: "approved", profile_status: "reviewed" })
            .eq("id", profile.id);
          if (u2) throw u2;
        } else throw uErr;
      }

      const { error: aErr } = await supabase.from("audit_logs").insert({
        faculty_id: profile.id,
        actor: "admin",
        action: "approve",
        detail: "Profile reviewed and confirmed by admin",
      });
      if (aErr) throw aErr;

      router.push("/admin/faculty");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!profile?.id) return;
    const note = revisionNote.trim();
    if (!note) {
      setRevisionModalError(true);
      return;
    }
    setRevisionModalError(false);
    setBusy(true);
    try {
      const { error: uErr } = await supabase
        .from("faculty_profiles")
        .update({ 
          status: "revision",
          profile_status: "revision",
          admin_feedback: note 
        })
        .eq("id", profile.id);
      if (uErr) throw uErr;

      const { error: mErr } = await supabase.from("messages").insert({
        from_admin: true,
        to_faculty: profile.id,
        subject: "Profile Revision Required",
        body: note,
      });
      if (mErr) throw mErr;

      const { error: aErr } = await supabase.from("audit_logs").insert({
        faculty_id: profile.id,
        actor: "admin",
        action: "revision",
        detail: note,
      });
      if (aErr) throw aErr;

      await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profile.email,
          toName: profile.name,
          fromName: "FPMP Administration",
          subject: "Profile Revision Required",
          body: note,
          type: "contact",
        }),
      });

      setRevisionModalOpen(false);
      router.push("/admin/faculty");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Revision request failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!profile?.id) return;
    if (!window.confirm("Are you sure you want to reject this profile?")) return;
    setBusy(true);
    try {
      const { error: uErr } = await supabase
        .from("faculty_profiles")
        .update({ status: "draft", profile_status: "draft" })
        .eq("id", profile.id);
      if (uErr) throw uErr;

      const { error: aErr } = await supabase.from("audit_logs").insert({
        faculty_id: profile.id,
        actor: "admin",
        action: "reject",
        detail: "Profile rejected and returned to draft",
      });
      if (aErr) throw aErr;

      router.push("/admin/faculty");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRevise = () => {
    setRevisionNote(adminNotes);
    setRevisionModalError(false);
    setRevisionModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-6 py-6 font-body text-[14px] text-slate-600">Loading…</div>
      </AdminLayout>
    );
  }

  if (loadError || !profile) {
    return (
      <AdminLayout>
        <div className="px-6 py-6 font-body text-[14px] text-red-600">
          {loadError || "Profile not found."}
        </div>
      </AdminLayout>
    );
  }

  const submittedLabel = formatDate(profile.updated_at || profile.created_at);
  const previousLabel = previous ? "Last approved" : "First submission";

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="flex flex-col items-start gap-4 px-6 pb-4 pt-6 md:flex-row md:items-center">
        <button
          onClick={() => router.push("/admin/faculty")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-headline text-[12px] font-semibold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          ← Back to Faculty
        </button>

        <div className="flex-1">
          <h1 className="font-headline text-[20px] font-bold text-slate-900">
            Profile Review — {profile.name}
          </h1>
          <p className="font-body text-[13px] text-slate-500">
            Pending review · {profile.department ?? "—"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          <button
            type="button"
            onClick={handleRevise}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 font-headline text-[13px] font-medium text-amber-900 shadow-sm transition-colors hover:bg-amber-200 disabled:opacity-50"
          >
            <RotateCcw size={14} /> Request Revision
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-100 px-4 py-2 font-headline text-[13px] font-medium text-red-700 shadow-sm transition-colors hover:bg-red-200 disabled:opacity-50"
          >
            <CloseIcon size={14} /> Reject
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 font-headline text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check size={14} /> Mark as Reviewed
          </button>
        </div>
      </div>

      {/* REVIEWER NOTES BOX */}
      <div className="mx-6 mb-4 flex flex-col items-start gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row">
        <div className="flex-1 w-full">
          <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Admin Notes (sent to faculty if revision requested)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Add internal notes or feedback for the faculty member..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>

        <div className="w-full min-w-[200px] md:w-auto">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Submission Info
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Submitted by</span>
              <span className="font-semibold text-slate-900">{profile.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Submitted on</span>
              <span className="font-semibold text-slate-900">{submittedLabel}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Profile version</span>
              <span className="font-semibold text-slate-900">—</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Previous status</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-amber-800">
                {profile.status === "pending" ? "Pending" : profile.status ?? "—"}
              </span>
            </div>
            {profile.note_to_admin && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="block font-label text-[10px] font-bold uppercase text-blue-600 mb-1">Faculty Note</span>
                <p className="font-body text-[12px] text-blue-900 italic">"{profile.note_to_admin}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIFF VIEW COLUMN LABELS */}
      <div className="mx-6 mb-2 flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
          <span className="font-headline text-[12px] font-bold text-red-700">
            Previous Version
          </span>
          <span className="ml-auto font-body text-[11px] text-slate-500">{previousLabel}</span>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-green-600" />
          <span className="font-headline text-[12px] font-bold text-green-700">
            Submitted Version
          </span>
          <span className="ml-auto font-body text-[11px] text-slate-500">
            Pending review · {submittedLabel}
          </span>
        </div>
      </div>

      {/* DIFF SECTIONS */}
      <div className="mx-6 mb-6 flex flex-col gap-4">
        {/* SECTION 1: ABOUT */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <User size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              About
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevAbout, currAbout)
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevAbout, currAbout) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[13px] leading-relaxed text-slate-600">First submission</p>
              ) : (
                <p className="font-body text-[13px] leading-relaxed text-slate-700">{prevAbout || "—"}</p>
              )}
            </div>
            <div className="flex-1 border-green-200 bg-[#F0FFF4] p-4 md:border-l-0">
              <p className="font-body text-[13px] leading-relaxed text-slate-700">{currAbout || "—"}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: PUBLICATIONS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <BookOpen size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Publications
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevPub, currPub) ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevPub, currPub) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[13px] text-slate-600">First submission</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {(prevPub as any[]).map((paper, idx) => (
                    <li
                      key={idx}
                      className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                    >
                      {idx + 1}. {paper?.title ?? "—"}{" "}
                      {paper?.journal ? `— ${paper.journal}` : paper?.venue ? `— ${paper.venue}` : ""}
                    </li>
                  ))}
                  {prevPub.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
                </ul>
              )}
            </div>
            <div className="flex-1 bg-[#F0FFF4] p-4">
              <ul className="flex flex-col gap-2">
                {(currPub as any[]).map((paper, idx) => (
                  <li
                    key={idx}
                    className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                  >
                    {idx + 1}. {paper?.title ?? "—"}{" "}
                    {paper?.journal ? `— ${paper.journal}` : paper?.venue ? `— ${paper.venue}` : ""}
                  </li>
                ))}
                {currPub.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 3: RESEARCH KEYWORDS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Tag size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Research Keywords
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevKw, currKw) ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevKw, currKw) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[12px] text-slate-600">First submission</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(prevKw as string[]).map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-slate-200 px-2.5 py-1 font-label text-[11px] font-semibold text-slate-600"
                    >
                      {kw}
                    </span>
                  ))}
                  {prevKw.length === 0 && <span className="font-body text-[12px] text-slate-500">—</span>}
                </div>
              )}
            </div>
            <div className="flex-1 bg-[#F0FFF4] p-4">
              <div className="flex flex-wrap gap-1.5">
                {(currKw as string[]).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-slate-200 px-2.5 py-1 font-label text-[11px] font-semibold text-slate-600"
                  >
                    {kw}
                  </span>
                ))}
                {currKw.length === 0 && <span className="font-body text-[12px] text-slate-500">—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: AWARDS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Trophy size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Awards
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevAwards, currAwards)
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevAwards, currAwards) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[12px] text-slate-600">First submission</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {(prevAwards as any[]).map((a, idx) => (
                    <li
                      key={idx}
                      className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                    >
                      {idx + 1}. {a?.title ?? "—"}
                      {a?.organization || a?.subtitle ? ` — ${a.organization ?? a.subtitle}` : ""}
                      {a?.year ? `, ${a.year}` : ""}
                    </li>
                  ))}
                  {prevAwards.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
                </ul>
              )}
            </div>
            <div className="flex-1 bg-[#F0FFF4] p-4">
              <ul className="flex flex-col gap-2">
                {(currAwards as any[]).map((a, idx) => (
                  <li
                    key={idx}
                    className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                  >
                    {idx + 1}. {a?.title ?? "—"}
                    {a?.organization || a?.subtitle ? ` — ${a.organization ?? a.subtitle}` : ""}
                    {a?.year ? `, ${a.year}` : ""}
                  </li>
                ))}
                {currAwards.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 5: EDUCATION */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <GraduationCap size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Education
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevEdu, currEdu) ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevEdu, currEdu) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[12px] text-slate-600">First submission</p>
              ) : (
                      <ul className="flex flex-col gap-2">
                  {(prevEdu as any[]).map((e, idx) => (
                    <li
                      key={idx}
                      className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                    >
                      • {e?.degree ?? "—"} — {e?.institution ?? "—"}
                      {e?.year ? ` (${e.year})` : ""}
                    </li>
                  ))}
                  {prevEdu.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
                </ul>
              )}
            </div>
            <div className="flex-1 bg-[#F0FFF4] p-4">
              <ul className="flex flex-col gap-2">
                {(currEdu as any[]).map((e, idx) => (
                  <li
                    key={idx}
                    className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                  >
                    • {e?.degree ?? "—"} — {e?.institution ?? "—"}
                    {e?.year ? ` (${e.year})` : ""}
                  </li>
                ))}
                {currEdu.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 6: CERTIFICATIONS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Award size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Certifications
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevCert, currCert)
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevCert, currCert) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[12px] text-slate-600">First submission</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {(prevCert as any[]).map((c, idx) => (
                    <li
                      key={idx}
                      className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                    >
                      {idx + 1}. {c?.title ?? c?.name ?? "—"}
                      {c?.organization || c?.org ? ` — ${c.organization ?? c.org}` : ""}
                      {c?.year ? `, ${c.year}` : ""}
                    </li>
                  ))}
                  {prevCert.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
                </ul>
              )}
            </div>
            <div className="flex-1 bg-[#F0FFF4] p-4">
              <ul className="flex flex-col gap-2">
                {(currCert as any[]).map((c, idx) => (
                  <li
                    key={idx}
                    className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                  >
                    {idx + 1}. {c?.title ?? c?.name ?? "—"}
                    {c?.organization || c?.org ? ` — ${c.organization ?? c.org}` : ""}
                    {c?.year ? `, ${c.year}` : ""}
                  </li>
                ))}
                {currCert.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 7: INVITED TALKS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Mic size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Invited Talks
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 font-label text-[10px] font-bold ${
                sectionModified(prevTalks, currTalks)
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {sectionModified(prevTalks, currTalks) ? "Modified" : "No Change"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-[#FFF8F8] p-4 md:border-b-0 md:border-r md:border-red-300">
              {!previous ? (
                <p className="font-body text-[12px] text-slate-600">First submission</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {(prevTalks as any[]).map((t, idx) => (
                    <li
                      key={idx}
                      className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                    >
                      {idx + 1}. {t?.topic ?? t?.title ?? "—"}
                      {t?.event || t?.venue ? ` — ${t.event ?? t.venue}` : ""}
                      {t?.date ? ` (${t.date})` : ""}
                      {t?.mode ? ` · ${t.mode}` : ""}
                    </li>
                  ))}
                  {prevTalks.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
                </ul>
              )}
            </div>
            <div className="flex-1 bg-[#F0FFF4] p-4">
              <ul className="flex flex-col gap-2">
                {(currTalks as any[]).map((t, idx) => (
                  <li
                    key={idx}
                    className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600"
                  >
                    {idx + 1}. {t?.topic ?? t?.title ?? "—"}
                    {t?.event || t?.venue ? ` — ${t.event ?? t.venue}` : ""}
                    {t?.date ? ` (${t.date})` : ""}
                    {t?.mode ? ` · ${t.mode}` : ""}
                  </li>
                ))}
                {currTalks.length === 0 && <li className="font-body text-[12px] text-slate-500">—</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="mx-6 mb-10 flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5 md:flex-row md:items-center md:gap-6 shadow-sm">
        <span className="font-headline text-[13px] font-bold uppercase tracking-wider text-slate-600 shrink-0">
          Change Summary
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {[
            sectionModified(prevAbout, currAbout) ? "About" : null,
            sectionModified(prevPub, currPub) ? "Publications" : null,
            sectionModified(prevKw, currKw) ? "Keywords" : null,
            sectionModified(prevAwards, currAwards) ? "Awards" : null,
            sectionModified(prevEdu, currEdu) ? "Education" : null,
            sectionModified(prevCert, currCert) ? "Certifications" : null,
            sectionModified(prevTalks, currTalks) ? "Invited Talks" : null,
          ]
            .filter(Boolean)
            .map((label) => (
              <span
                key={label as string}
                className="rounded-full bg-amber-100 px-3 py-1 font-label text-[11px] font-bold tracking-wide text-amber-800"
              >
                {label} modified
              </span>
            ))}
          {![
            sectionModified(prevAbout, currAbout),
            sectionModified(prevPub, currPub),
            sectionModified(prevKw, currKw),
            sectionModified(prevAwards, currAwards),
            sectionModified(prevEdu, currEdu),
            sectionModified(prevCert, currCert),
            sectionModified(prevTalks, currTalks),
          ].some(Boolean) && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-label text-[11px] font-bold text-slate-600">
              No structural changes detected
            </span>
          )}
        </div>
      </div>

      {revisionModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="font-headline text-[15px] font-bold text-slate-900">Request revision</h3>
            <p className="mt-1 font-body text-[12px] text-slate-500">
              Notes will be saved to messages, audit log, and emailed to the faculty member.
            </p>
            <textarea
              value={revisionNote}
              onChange={(e) => {
                setRevisionNote(e.target.value);
                setRevisionModalError(false);
              }}
              rows={4}
              className={`mt-3 w-full rounded-lg border px-3 py-2 font-body text-[13px] outline-none ${
                revisionModalError ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Revision notes for the faculty…"
            />
            {revisionModalError && (
              <p className="mt-1 font-body text-[11px] text-red-500">Please enter revision notes.</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevisionModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-headline text-[12px] font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevisionSubmit}
                disabled={busy}
                className="rounded-lg bg-amber-600 px-4 py-2 font-headline text-[12px] font-bold text-white disabled:opacity-50"
              >
                Send revision
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
