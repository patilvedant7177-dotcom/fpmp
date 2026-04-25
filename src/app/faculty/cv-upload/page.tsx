"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type UploadState = "idle" | "uploading" | "success" | "error";

type SectionId =
  | "basic"
  | "about"
  | "education"
  | "publications"
  | "awards"
  | "projects"
  | "certifications"
  | "invited_talks"
  | "custom_sections";

const SECTION_ORDER: SectionId[] = [
  "basic",
  "about",
  "education",
  "publications",
  "projects",
  "awards",
  "certifications",
  "invited_talks",
  "custom_sections",
];

const SECTION_LABELS: Record<SectionId, string> = {
  basic: "Basic Info",
  about: "About",
  education: "Education",
  publications: "Publications",
  projects: "Projects",
  awards: "Awards",
  certifications: "Certifications",
  invited_talks: "Invited Talks",
  custom_sections: "Additional Info",
};

type WorkingData = {
  name: string;
  designation: string;
  department: string;
  experience: string;
  email: string;
  phone: string;
  keywords: string[];
  about: string;
  education: Array<{ degree: string; institution: string; year: string; field: string }>;
  publications: Array<{
    title: string;
    journal: string;
    type: string;
    year: string;
    doi: string;
    index_tag: string;
    award: string;
  }>;
  projects: Array<{ title: string; description: string; role: string; year: string }>;
  awards: Array<{ title: string; organization: string; year: string }>;
  certifications: Array<{ title: string; organization: string; year: string }>;
  invited_talks: Array<{ topic: string; event: string; date: string; mode: string }>;
  custom_sections: Array<{ title: string; content: string }>;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => {
      const res = reader.result;
      if (typeof res !== "string") {
        reject(new Error("Failed to read file."));
        return;
      }
      // data:application/pdf;base64,....
      const base64 = res.includes(",") ? res.split(",").pop()! : res;
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

function normalizeExtracted(raw: Record<string, unknown>): WorkingData {
  const keywords = Array.isArray(raw.keywords) ? (raw.keywords as string[]) : [];
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    designation: typeof raw.designation === "string" ? raw.designation : "",
    department: typeof raw.department === "string" ? raw.department : "",
    experience: typeof raw.experience === "string" ? raw.experience : "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    keywords,
    about: typeof raw.about === "string" ? raw.about : "",
    education: Array.isArray(raw.education)
      ? (raw.education as Record<string, string>[]).map((e) => ({
          degree: e.degree ?? "",
          institution: e.institution ?? "",
          year: e.year ?? "",
          field: typeof e.field === "string" ? e.field : "",
        }))
      : [],
    publications: Array.isArray(raw.publications)
      ? (raw.publications as Record<string, string>[]).map((p) => ({
          title: p.title ?? "",
          journal: p.venue ?? "",
          type: p.type || "journal",
          year: p.year ?? "",
          doi: p.doi ?? "",
          index_tag: p.index_tag ?? "",
          award: p.award ?? "",
        }))
      : [],
    projects: Array.isArray(raw.projects)
      ? (raw.projects as Record<string, string>[]).map((p) => ({
          title: p.title ?? "",
          description: p.description ?? "",
          role: p.role ?? "",
          year: p.year ?? "",
          url: p.url ?? "",
        }))
      : [],
    awards: Array.isArray(raw.awards)
      ? (raw.awards as Record<string, string>[]).map((a) => ({
          title: a.title ?? "",
          organization: a.body ?? "",
          year: a.year ?? "",
        }))
      : [],
    certifications: Array.isArray(raw.certifications)
      ? (raw.certifications as Record<string, string>[]).map((c) => ({
          title: c.name ?? "",
          organization: c.org ?? "",
          year: c.year ?? "",
        }))
      : [],
    invited_talks: Array.isArray(raw.invited_talks)
      ? (raw.invited_talks as Record<string, string>[]).map((t) => ({
          topic: t.topic ?? "",
          event: t.event ?? "",
          date: t.date ?? "",
          mode: t.mode ?? "",
        }))
      : [],
    custom_sections: Array.isArray(raw.custom_sections)
      ? (raw.custom_sections as Record<string, string>[]).map((c) => ({
          title: c.title ?? "",
          content: c.content ?? "",
        }))
      : [],
  };
}

function normalizeResumeExtracted(raw: Record<string, unknown>): WorkingData {
  const skills = Array.isArray(raw.skills) ? (raw.skills as string[]) : [];
  const education = Array.isArray(raw.education)
    ? (raw.education as Record<string, string>[]).map((e) => ({
        degree: e.degree ?? "",
        institution: e.institution ?? "",
        year: e.year ?? "",
        field: "",
      }))
    : [];
  const experience = Array.isArray(raw.experience) ? (raw.experience as Record<string, string>[]) : [];
  const aboutFromExp = experience
    .map((x) => [x.title, x.company, x.duration].filter(Boolean).join(" · "))
    .filter(Boolean)
    .slice(0, 4)
    .join("\n");

  return {
    name: typeof raw.name === "string" ? raw.name : "",
    designation: "",
    department: "",
    experience: "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    keywords: skills,
    about: aboutFromExp,
    education,
    publications: [],
    projects: [],
    awards: [],
    certifications: [],
    invited_talks: [],
    custom_sections: [],
  };
}

function mergeResumeParsed(primary: Record<string, unknown>, fallback: Record<string, unknown>) {
  const pickStr = (a: unknown, b: unknown) =>
    typeof a === "string" && a.trim() ? a : typeof b === "string" ? b : "";
  const pickArr = (a: unknown, b: unknown) => (Array.isArray(a) && a.length ? a : Array.isArray(b) ? b : []);

  return {
    ...fallback,
    ...primary,
    name: pickStr(primary.name, fallback.name),
    email: pickStr(primary.email, fallback.email),
    phone: pickStr(primary.phone, fallback.phone),
    linkedin: pickStr((primary as any).linkedin, (fallback as any).linkedin),
    github: pickStr((primary as any).github, (fallback as any).github),
    skills: pickArr((primary as any).skills, (fallback as any).skills),
    education: pickArr((primary as any).education, (fallback as any).education),
    experience: pickArr((primary as any).experience, (fallback as any).experience),
  } as Record<string, unknown>;
}

function parsedFieldScore(raw: Record<string, unknown>): number {
  let n = 0;
  const s = (v: unknown) => typeof v === "string" && v.trim();
  if (s(raw.name)) n++;
  if (s(raw.email)) n++;
  if (s(raw.phone)) n++;
  if (s((raw as any).linkedin)) n++;
  if (s((raw as any).github)) n++;
  if (Array.isArray((raw as any).skills) && (raw as any).skills.length) n++;
  if (Array.isArray((raw as any).education) && (raw as any).education.length) n++;
  if (Array.isArray((raw as any).experience) && (raw as any).experience.length) n++;
  return n;
}

function countObjectFields(obj: Record<string, unknown>): number {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (v == null) continue;
    if (typeof v === "string" && v.trim()) n++;
    else if (typeof v === "number" && !Number.isNaN(v)) n++;
  }
  return n;
}

function countTableRowsFields(rows: Record<string, unknown>[]): number {
  let n = 0;
  for (const row of rows) {
    n += countObjectFields(row);
  }
  return n;
}

function sectionFieldCount(section: SectionId, data: WorkingData): number {
  switch (section) {
    case "basic": {
      let n = 0;
      if (data.name.trim()) n++;
      if (data.designation.trim()) n++;
      if (data.department.trim()) n++;
      if (data.experience.trim()) n++;
      if (data.email.trim()) n++;
      if (data.phone.trim()) n++;
      if (data.keywords.some((k) => String(k).trim())) n++;
      return n;
    }
    case "about": {
      const a = data.about.trim();
      if (!a) return 0;
      return Math.min(3, Math.max(1, Math.ceil(a.length / 120)));
    }
    case "education":
      return countTableRowsFields(data.education as unknown as Record<string, unknown>[]);
    case "publications":
      return countTableRowsFields(data.publications as unknown as Record<string, unknown>[]);
    case "projects":
      return countTableRowsFields(data.projects as unknown as Record<string, unknown>[]);
    case "awards":
      return countTableRowsFields(data.awards as unknown as Record<string, unknown>[]);
    case "certifications":
      return countTableRowsFields(data.certifications as unknown as Record<string, unknown>[]);
    case "invited_talks":
      return countTableRowsFields(data.invited_talks as unknown as Record<string, unknown>[]);
    default:
      return 0;
  }
}

function confidenceLevel(count: number): "high" | "medium" | "low" {
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  return "low";
}

function applyArrayDrafts(
  data: WorkingData,
  drafts: Partial<Record<SectionId, string>>,
): WorkingData {
  let d = data;
  const apply = (section: SectionId, parsed: unknown[]) => {
    if (section === "education") d = { ...d, education: parsed as WorkingData["education"] };
    else if (section === "publications") d = { ...d, publications: parsed as WorkingData["publications"] };
    else if (section === "projects") d = { ...d, projects: parsed as WorkingData["projects"] };
    else if (section === "awards") d = { ...d, awards: parsed as WorkingData["awards"] };
    else if (section === "certifications") d = { ...d, certifications: parsed as WorkingData["certifications"] };
    else if (section === "invited_talks") d = { ...d, invited_talks: parsed as WorkingData["invited_talks"] };
  };
  for (const section of SECTION_ORDER) {
    if (section === "basic" || section === "about") continue;
    const raw = drafts[section];
    if (raw === undefined) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) apply(section, parsed);
    } catch {
      /* skip invalid */
    }
  }
  return d;
}

function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const styles =
    level === "high"
      ? "bg-green-100 text-green-800 border-green-200"
      : level === "medium"
        ? "bg-yellow-100 text-yellow-900 border-yellow-200"
        : "bg-red-100 text-red-800 border-red-200";
  const label = level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
  return (
    <span
      className={`rounded-md border px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}

const calculateCompletion = (profile: Record<string, unknown>) => {
  let score = 0;
  if (profile.name && profile.email && profile.department) score += 10;
  if (profile.about && String(profile.about).length > 20) score += 15;
  if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) score += 10;
  if (profile.publications && Array.isArray(profile.publications) && profile.publications.length > 0) score += 20;
  if (profile.projects && Array.isArray(profile.projects) && profile.projects.length > 0) score += 10;
  if (profile.keywords && Array.isArray(profile.keywords) && profile.keywords.length > 0) score += 10;
  if (profile.awards && Array.isArray(profile.awards) && profile.awards.length > 0) score += 10;
  if (profile.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0)
    score += 10;
  if (profile.invited_talks && Array.isArray(profile.invited_talks) && profile.invited_talks.length > 0) score += 10;
  if (profile.social_links && typeof profile.social_links === "object" && Object.keys(profile.social_links as object).length > 0)
    score += 5;
  return score;
};

export default function CVUploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileHint, setFileHint] = useState("");
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [working, setWorking] = useState<WorkingData | null>(null);
  const [openSection, setOpenSection] = useState<SectionId | null>("basic");
  const [editing, setEditing] = useState<Record<SectionId, boolean>>(() =>
    SECTION_ORDER.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<SectionId, boolean>),
  );
  const [accepted, setAccepted] = useState<Record<SectionId, boolean>>(() =>
    SECTION_ORDER.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<SectionId, boolean>),
  );

  const [extractOverlay, setExtractOverlay] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [extractOverlayText, setExtractOverlayText] = useState("Extracting resume data...");

  const [acceptAllProgress, setAcceptAllProgress] = useState(0);
  const [acceptAllRunning, setAcceptAllRunning] = useState(false);
  const [acceptAllError, setAcceptAllError] = useState("");

  /** Raw JSON while editing array sections (avoids controlled input reset on invalid JSON). */
  const [arrayEditDraft, setArrayEditDraft] = useState<Partial<Record<SectionId, string>>>({});

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setProfile(null);
          return;
        }
        const { data: profileData, error } = await supabase
          .from("faculty_profiles")
          .select("id, user_id, completion")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        if (error) {
          const e = error as any;
          console.error(
            "CV upload profile load:",
            e?.message ?? String(error),
            { code: e?.code, details: e?.details, hint: e?.hint },
          );
          setProfile(null);
          return;
        }
        if (!profileData) {
          // No faculty_profile row yet for this user.
          setProfile(null);
          return;
        }
        setProfile(profileData as unknown as Record<string, unknown>);
      } catch (e) {
        console.error(e);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  const updateCompletionScore = useCallback(async (profileId: string, merged: Record<string, unknown>) => {
    const score = calculateCompletion(merged);
    if (merged.completion !== score) {
      await supabase.from("faculty_profiles").update({ completion: score }).eq("id", profileId);
    }
  }, []);

  const saveSection = useCallback(
    async (section: SectionId, profileId: string, data: WorkingData) => {
      if (section === "basic") {
        const { error } = await supabase
          .from("faculty_profiles")
          .update({
            name: data.name,
            designation: data.designation,
            department: data.department,
            experience: data.experience,
            email: data.email,
            phone: data.phone,
            keywords: data.keywords,
          })
          .eq("id", profileId);
        if (error) throw error;
        return;
      }
      if (section === "about") {
        const { error } = await supabase.from("faculty_profiles").update({ about: data.about }).eq("id", profileId);
        if (error) throw error;
        return;
      }
      if (section === "custom_sections") {
        const { error } = await supabase.from("faculty_profiles").update({ custom_sections: data.custom_sections }).eq("id", profileId);
        if (error) throw error;
        return;
      }
      const table = section;
      const { error: delError } = await supabase.from(table).delete().eq("faculty_id", profileId);
      if (delError) throw delError;

      let rows: Record<string, unknown>[] = [];

      const parseYear = (y: any) => {
        if (!y) return null;
        const num = parseInt(String(y).trim(), 10);
        return isNaN(num) ? null : num;
      };

      if (section === "education") {
        rows = (data.education as any[])
          .filter(e => e.degree && String(e.degree).trim() !== "")
          .map((e) => ({
            degree: e.degree,
            institution: e.institution,
            year: parseYear(e.year),
          }));
      } else if (section === "publications") {
        rows = (data.publications as any[])
          .filter(p => p.title && String(p.title).trim() !== "")
          .map((p) => {
            const rawType = String(p.type || "").toLowerCase();
            const safeType = rawType.includes("conference") ? "conference" : "journal";
            return {
              title: String(p.title).trim(),
              venue: String(p.journal || "").trim(),
              type: safeType,
              year: parseYear(p.year),
              doi: p.doi || null,
              index_tag: p.index_tag || null,
              award: p.award || null,
            };
          });
      } else if (section === "projects") {
        rows = (data.projects as any[])
          .filter(p => p.title && String(p.title).trim() !== "")
          .map((p) => ({
            title: p.title,
            description: p.description,
            role: p.role,
            year: p.year ? String(p.year).trim() : null,
            url: p.url || null,
          }));
      } else if (section === "awards") {
        rows = (data.awards as any[])
          .filter(a => a.title && String(a.title).trim() !== "")
          .map((a) => ({
            title: a.title,
            body: a.organization,
            year: parseYear(a.year),
          }));
      } else if (section === "certifications") {
        rows = (data.certifications as any[])
          .filter(c => c.title && String(c.title).trim() !== "")
          .map((c) => ({
            name: c.title,
            org: c.organization,
            year: parseYear(c.year),
          }));
      } else if (section === "invited_talks") {
        rows = (data.invited_talks as any[])
          .filter(t => t.topic && String(t.topic).trim() !== "")
          .map((t) => {
            const rawMode = String(t.mode || "").toLowerCase();
            const safeMode = rawMode.includes("online") ? "online" : "offline";
            return {
              topic: String(t.topic).trim(),
              event: String(t.event || "").trim(),
              date: String(t.date || "").trim(),
              mode: safeMode,
            };
          });
      }

      if (rows.length > 0) {
        const toInsert = rows.map((item) => {
          const { id: _id, created_at: _c, faculty_id: _f, ...rest } = item as Record<string, unknown> & {
            id?: string;
            created_at?: string;
            faculty_id?: string;
          };
          return { ...rest, faculty_id: profileId };
        });
        const { error: insError } = await supabase.from(table).insert(toInsert);
        if (insError) throw insError;
      }
    },
    [],
  );

  const mergeProfileForCompletion = useCallback(
    (data: WorkingData) => ({
      ...profile,
      ...data,
      education: data.education,
      publications: data.publications,
      projects: data.projects,
      awards: data.awards,
      certifications: data.certifications,
      invited_talks: data.invited_talks,
      custom_sections: data.custom_sections,
    }),
    [profile],
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const validateAndSetFile = (selected: File) => {
    setFileHint("");
    setErrorMsg("");
    if (selected.type !== "application/pdf") {
      setFileHint("Only PDF files are accepted.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileHint("File exceeds the 10 MB size limit.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const runUploadAndExtract = async () => {
    if (!file || !profile?.id) {
      setErrorMsg(!profile?.id ? "Could not load your faculty profile. Try refreshing the page." : "Choose a PDF first.");
      return;
    }

    setErrorMsg("");
    setFileHint("");
    setUploadingFile(true);
    setUsedLocalFallback(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be signed in to upload.");
      }

      const objectPath = `${user.id}/${Date.now()}.pdf`;
      const { error: upError } = await supabase.storage
        .from("cvs")
        .upload(objectPath, file, { contentType: "application/pdf" });

      if (upError) {
        // Common in new Supabase projects: Storage RLS policies not configured yet.
        // Fallback to a server-side upload route using the service role key.
        const msg = upError.message || "Storage upload failed.";
        if (/row-level security|violates row-level security|RLS/i.test(msg)) {
          const upForm = new FormData();
          upForm.append("file", file);
          const upRes = await fetch("/api/upload-cv", { method: "POST", body: upForm });
          const upJson = await upRes.json().catch(() => ({}));
          if (!upRes.ok) {
            throw new Error(typeof upJson.error === "string" ? upJson.error : msg);
          }
        } else {
          throw new Error(msg);
        }
      }

      setUploadingFile(false);
      setExtractOverlay(true);
      setExtractOverlayText("Extracting with AI...");

      const base64 = await fileToBase64(file);

      const form = new FormData();
      form.append("file", file);

      const primaryRes = await fetch("/api/extract-cv", {
        method: "POST",
        body: form,
      });
      const primaryJson = await primaryRes.json().catch(() => ({}));

      if (!primaryRes.ok || primaryJson.error) {
        throw new Error(
          typeof primaryJson.error === "string" 
            ? primaryJson.error 
            : `Server error ${primaryRes.status}`
        );
      }

      const extracted = primaryJson.data ?? {};
      const normalized = normalizeExtracted(extracted as any);

      setExtractOverlayText("Generating Biography...");
      try {
        const genRes = await fetch("/api/generate-about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: normalized.name,
            designation: normalized.designation,
            department: normalized.department,
            experience: normalized.experience,
            keywords: normalized.keywords,
            education: normalized.education,
          }),
        });
        const genJson = await genRes.json();
        if (genRes.ok && typeof genJson.about === "string" && genJson.about.trim()) {
          normalized.about = genJson.about.trim();
        }
      } catch (e) {
        console.warn("Failed to pre-generate about:", e);
      }

      setWorking(normalized);
      setArrayEditDraft({});
      setAccepted(SECTION_ORDER.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<SectionId, boolean>));
      setEditing(SECTION_ORDER.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<SectionId, boolean>));
      setOpenSection("basic");
      setUploadState("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
      setUploadState("error");
    } finally {
      setExtractOverlay(false);
      setUploadingFile(false);
    }
  };

  const handleAcceptSection = async (section: SectionId) => {
    if (!working || !profile?.id) return;
    const data = commitArrayDraft(section, working);
    if (data !== working) setWorking(data);
    try {
      await saveSection(section, profile.id as string, data);
      setAccepted((a) => ({ ...a, [section]: true }));
      await updateCompletionScore(profile.id as string, mergeProfileForCompletion(data));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as any)?.message || "Save failed.";
      console.warn("Save section error:", message);
      setErrorMsg(message);
    }
  };

  const handleAcceptAll = async () => {
    if (!working || !profile?.id) return;
    setAcceptAllError("");
    setAcceptAllRunning(true);
    setAcceptAllProgress(0);

    const merged = applyArrayDrafts(working, arrayEditDraft);
    setWorking(merged);
    setArrayEditDraft({});

    try {
      const n = SECTION_ORDER.length;
      for (let i = 0; i < n; i++) {
        const section = SECTION_ORDER[i];
        await saveSection(section, profile.id as string, merged);
        setAccepted((a) => ({ ...a, [section]: true }));
        setAcceptAllProgress(Math.round(((i + 1) / n) * 100));
      }

      await updateCompletionScore(profile.id as string, mergeProfileForCompletion(merged));

      // Redundant generation removed since it is now generated during initial extraction.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as any)?.message || "Accept all failed.";
      console.warn("Accept all error:", message);
      setAcceptAllError(message);
    } finally {
      setAcceptAllRunning(false);
    }
  };

  const reset = () => {
    setFile(null);
    setUploadState("idle");
    setErrorMsg("");
    setFileHint("");
    setWorking(null);
    setAcceptAllProgress(0);
    setAcceptAllError("");
    setExtractOverlay(false);
    setUploadingFile(false);
    setArrayEditDraft({});
  };

  const toggleSection = (id: SectionId) => {
    setOpenSection((o) => (o === id ? null : id));
  };

  const commitArrayDraft = (section: SectionId, data: WorkingData): WorkingData => {
    if (section === "basic" || section === "about") return data;
    const raw = arrayEditDraft[section];
    if (raw === undefined) return data;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return data;
      let next = data;
      if (section === "education") next = { ...data, education: parsed as WorkingData["education"] };
      else if (section === "publications") next = { ...data, publications: parsed as WorkingData["publications"] };
      else if (section === "projects") next = { ...data, projects: parsed as WorkingData["projects"] };
      else if (section === "awards") next = { ...data, awards: parsed as WorkingData["awards"] };
      else if (section === "certifications") next = { ...data, certifications: parsed as WorkingData["certifications"] };
      else if (section === "invited_talks") next = { ...data, invited_talks: parsed as WorkingData["invited_talks"] };
      else next = { ...data, custom_sections: parsed as WorkingData["custom_sections"] };
      setArrayEditDraft((d) => {
        const copy = { ...d };
        delete copy[section];
        return copy;
      });
      return next;
    } catch {
      return data;
    }
  };

  const renderReadonlySection = (section: SectionId, data: WorkingData) => {
    if (section === "basic") {
      return (
        <div className="text-left font-body text-[13px] text-green-900/90 space-y-2">
          <p>
            <span className="font-bold text-green-900">Name:</span> {data.name || "—"}
          </p>
          <p>
            <span className="font-bold text-green-900">Designation:</span> {data.designation || "—"}
          </p>
          <p>
            <span className="font-bold text-green-900">Department:</span> {data.department || "—"}
          </p>
          <p>
            <span className="font-bold text-green-900">Experience:</span> {data.experience || "—"}
          </p>
          <p>
            <span className="font-bold text-green-900">Email:</span> {data.email || "—"}
          </p>
          <p>
            <span className="font-bold text-green-900">Phone:</span> {data.phone || "—"}
          </p>
          <p>
            <span className="font-bold text-green-900">Keywords:</span>{" "}
            {data.keywords.length ? data.keywords.join(", ") : "—"}
          </p>
        </div>
      );
    }
    if (section === "about") {
      return (
        <p className="text-left font-body text-[13px] text-green-900/90 whitespace-pre-wrap">{data.about || "—"}</p>
      );
    }
    const arrays: Record<Exclude<SectionId, "basic" | "about">, unknown[]> = {
      education: data.education,
      publications: data.publications,
      projects: data.projects,
      awards: data.awards,
      certifications: data.certifications,
      invited_talks: data.invited_talks,
      custom_sections: data.custom_sections,
    };
    const list = arrays[section as Exclude<SectionId, "basic" | "about">];
    if (!list?.length) {
      return <p className="text-left font-body text-[13px] text-green-800/70 italic">No items extracted.</p>;
    }
    return (
      <div className="flex flex-col gap-3">
        {list.map((item: any, idx: number) => (
          <div key={idx} className="p-3 border border-green-200 bg-white rounded-lg shadow-sm text-left font-body text-[13px] text-green-900/90 flex flex-col gap-1.5">
            {Object.keys(item).map(k => (
               <div key={k} className="flex gap-2">
                 <span className="font-bold text-green-900 capitalize w-24 shrink-0">{k.replace("_", " ")}:</span>
                 <span className="break-words">{item[k] || "—"}</span>
               </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderEditSection = (section: SectionId, data: WorkingData) => {
    const inputCls =
      "w-full rounded-lg border border-green-200 bg-white px-3 py-2 font-body text-[13px] text-green-900 focus:border-primary outline-none";

    if (section === "basic") {
      return (
        <div className="flex flex-col gap-3 text-left">
          <input className={inputCls} value={data.name} onChange={(e) => setWorking({ ...data, name: e.target.value })} placeholder="Name" />
          <input
            className={inputCls}
            value={data.designation}
            onChange={(e) => setWorking({ ...data, designation: e.target.value })}
            placeholder="Designation"
          />
          <input
            className={inputCls}
            value={data.department}
            onChange={(e) => setWorking({ ...data, department: e.target.value })}
            placeholder="Department"
          />
          <input
            className={inputCls}
            value={data.experience}
            onChange={(e) => setWorking({ ...data, experience: e.target.value })}
            placeholder="Experience"
          />
          <input className={inputCls} value={data.email} onChange={(e) => setWorking({ ...data, email: e.target.value })} placeholder="Email" />
          <input className={inputCls} value={data.phone} onChange={(e) => setWorking({ ...data, phone: e.target.value })} placeholder="Phone" />
          <input
            className={inputCls}
            value={data.keywords.join(", ")}
            onChange={(e) =>
              setWorking({
                ...data,
                keywords: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Keywords (comma-separated)"
          />
        </div>
      );
    }
    if (section === "about") {
      return (
        <textarea
          className={`${inputCls} min-h-[140px]`}
          value={data.about}
          onChange={(e) => setWorking({ ...data, about: e.target.value })}
          placeholder="About"
        />
      );
    }
    const arrays: Record<Exclude<SectionId, "basic" | "about">, unknown[]> = {
      education: data.education,
      publications: data.publications,
      projects: data.projects,
      awards: data.awards,
      certifications: data.certifications,
      invited_talks: data.invited_talks,
      custom_sections: data.custom_sections,
    };
    const arr = arrays[section as Exclude<SectionId, "basic" | "about">];
    
    if (!Array.isArray(arr)) return null;

    const handleUpdate = (idx: number, key: string, val: string) => {
       const copy = [...arr] as any[];
       copy[idx] = { ...copy[idx], [key]: val };
       setWorking({ ...data, [section]: copy });
    };

    const handleDelete = (idx: number) => {
       const copy = [...arr] as any[];
       copy.splice(idx, 1);
       setWorking({ ...data, [section]: copy });
    };

    const handleAdd = () => {
       const copy = [...arr] as any[];
       let newItem = {};
       if (section === "education") newItem = { degree: "", institution: "", year: "", field: "" };
       else if (section === "publications") newItem = { title: "", journal: "", type: "journal", year: "", doi: "", index_tag: "", award: "" };
       else if (section === "projects") newItem = { title: "", description: "", role: "", year: "" };
       else if (section === "awards") newItem = { title: "", organization: "", year: "" };
       else if (section === "certifications") newItem = { title: "", organization: "", year: "" };
       else if (section === "invited_talks") newItem = { topic: "", event: "", date: "", mode: "offline" };
       else newItem = { title: "", content: "" };
       copy.push(newItem);
       setWorking({ ...data, [section]: copy });
    };

    return (
      <div className="flex flex-col gap-4 text-left">
        {arr.map((item: any, idx: number) => (
          <div key={idx} className="p-4 border border-green-200 bg-white rounded-lg shadow-sm relative group flex flex-col gap-3">
             <button onClick={() => handleDelete(idx)} className="absolute top-3 right-3 text-green-700/50 hover:text-red-500 transition-colors">
               <Trash2 size={16} />
             </button>
             {Object.keys(item).map(k => (
               <div key={k}>
                 <label className="font-label text-[10px] font-bold uppercase tracking-wider text-green-800 block mb-1">{k.replace("_", " ")}</label>
                 {k === 'description' || k === 'content' ? (
                   <textarea className={`${inputCls} min-h-[80px]`} value={item[k]} onChange={(e) => handleUpdate(idx, k, e.target.value)} />
                 ) : (
                   <input className={inputCls} value={item[k]} onChange={(e) => handleUpdate(idx, k, e.target.value)} />
                 )}
               </div>
             ))}
          </div>
        ))}
        <button onClick={handleAdd} className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-green-300 rounded-lg text-green-700 font-headline text-[13px] font-bold hover:bg-green-50 transition-colors">
           <Plus size={16} /> Add Item
        </button>
      </div>
    );
  };

  return (
    <FacultyLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {extractOverlay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-white/20 bg-surface px-10 py-8 shadow-xl">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="max-w-[280px] text-center font-body text-[14px] font-medium text-primary">
                {extractOverlayText}
              </p>
            </div>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="px-6 py-6 border-b border-outline-variant/30 shrink-0 bg-surface">
          <h1 className="font-headline text-[22px] font-bold tracking-tight text-primary">
            CV Auto-Fill Engine
          </h1>
          <p className="mt-1 font-body text-[14px] text-secondary">
            Upload your latest Resume / CV and let our AI automatically map your publications,
            education, and keywords directly to your profile.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-10 bg-surface-container-lowest flex items-start justify-center">
          <div className="w-full max-w-[600px] flex flex-col gap-6">
            {/* ── IDLE: Drop Zone ─────────────────────────────────────────── */}
            {uploadState === "idle" && (
              <>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive
                      ? "border-primary bg-primary-container/20 scale-[1.02]"
                      : "border-outline-variant bg-surface hover:border-primary/50 hover:bg-surface-container/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    id="cv-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-4 pointer-events-none">
                    <div className="h-16 w-16 bg-primary-container/30 text-primary rounded-full flex items-center justify-center mb-2">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="font-headline text-[18px] font-bold text-primary">
                      Drag &amp; Drop your CV here
                    </h3>
                    <p className="font-body text-[14px] text-secondary">
                      Accepts PDF files only · Max 10 MB
                    </p>
                    <div className="mt-4 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-headline font-bold text-[13px] shadow-sm pointer-events-auto">
                      Browse Files
                    </div>
                  </div>
                </div>
                {file && (
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-body text-[13px] text-secondary text-center">
                      <span className="font-medium text-primary">{file.name}</span>
                      <span className="text-outline"> · {formatFileSize(file.size)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={runUploadAndExtract}
                      disabled={uploadingFile || profileLoading || !profile}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-headline text-[14px] font-bold shadow-sm transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Uploading…
                        </>
                      ) : (
                        "Upload & Extract"
                      )}
                    </button>
                  </div>
                )}
                {fileHint && (
                  <p className="text-center font-body text-[13px] text-red-600">{fileHint}</p>
                )}
                {!profileLoading && !profile && (
                  <p className="text-center font-body text-[13px] text-secondary">
                    Sign in and ensure your faculty profile exists to upload.
                  </p>
                )}
              </>
            )}

            {/* ── ERROR (idle flow / extract) ───────────────────────────── */}
            {uploadState === "error" && (
              <div className="border border-red-200 rounded-xl p-8 bg-red-50 shadow-sm flex flex-col items-center text-center gap-5">
                <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="font-headline text-[18px] font-bold text-red-900 mb-1">
                    Extraction Failed
                  </h3>
                  <p className="font-body text-[13px] text-red-800/80 max-w-[420px] mx-auto">
                    {errorMsg}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-700 text-white rounded-lg font-headline text-[14px] font-bold shadow-sm transition-colors hover:bg-red-800 active:scale-95"
                >
                  <RefreshCw size={15} /> Try Again
                </button>
              </div>
            )}

            {/* ── SUCCESS: Accordions ─────────────────────────────────────── */}
            {uploadState === "success" && working && (
              <div className="border border-green-200 rounded-xl p-8 bg-green-50 shadow-sm flex flex-col gap-5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-headline text-[20px] font-bold text-green-900 mb-1">
                    Extraction Successful!
                  </h3>
                  <p className="font-body text-[14px] text-green-800/80 max-w-[450px] mx-auto">
                    AI extracted the following sections from your CV. Review each section, then
                    accept individually or use Accept All.
                  </p>
                  {usedLocalFallback && (
                    <p className="font-body text-[12px] text-green-800/70 italic">
                      Using local parser (cloud unavailable)
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  {SECTION_ORDER.map((section) => {
                    const level = confidenceLevel(sectionFieldCount(section, working));
                    const isOpen = openSection === section;
                    return (
                      <div
                        key={section}
                        className="rounded-lg border border-green-200 bg-white/80 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(section)}
                          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {accepted[section] && (
                              <CheckCircle2 size={18} className="shrink-0 text-green-600" aria-hidden />
                            )}
                            <span className="font-headline text-[14px] font-bold text-green-900 truncate">
                              {SECTION_LABELS[section]}
                            </span>
                            <ConfidenceBadge level={level} />
                          </div>
                          <ChevronDown
                            size={20}
                            className={`shrink-0 text-green-800 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="border-t border-green-100 px-4 py-4 space-y-4">
                            {editing[section]
                              ? renderEditSection(section, working)
                              : renderReadonlySection(section, working)}
                            <div className="flex flex-wrap gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editing[section] && working) {
                                    const next = commitArrayDraft(section, working);
                                    if (next !== working) setWorking(next);
                                  }
                                  setEditing((e) => ({ ...e, [section]: !e[section] }));
                                }}
                                className="px-4 py-2 rounded-lg border border-green-300 bg-transparent font-headline text-[13px] font-bold text-green-800 hover:bg-green-50 transition-colors"
                              >
                                {editing[section] ? "Done" : "Edit"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAcceptSection(section)}
                                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-headline text-[13px] font-bold shadow-sm hover:bg-primary/90 transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {acceptAllError && (
                  <p className="text-center font-body text-[13px] text-red-600">{acceptAllError}</p>
                )}

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    disabled={acceptAllRunning}
                    className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-headline text-[14px] font-bold shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    {acceptAllRunning ? "Saving…" : "Accept All"}
                  </button>
                  {acceptAllRunning && (
                    <div className="h-[8px] w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${acceptAllProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-2 flex-wrap justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-green-400 text-green-700 rounded-lg font-headline text-[13px] font-bold transition-colors hover:bg-green-100 active:scale-95"
                  >
                    <RefreshCw size={15} /> Upload Another
                  </button>
                  <button
                    onClick={() => router.push("/faculty/editor")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-lg font-headline text-[14px] font-bold shadow-sm transition-colors hover:bg-green-800 active:scale-95"
                  >
                    Review in Editor <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
