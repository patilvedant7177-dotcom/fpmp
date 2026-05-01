"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface FacultyMember {
  id: string;
  slug: string;
  name: string;
  designation: string;
  department: string;
  keywords?: string[] | null;
  status: "approved" | "pending" | "draft";
  completion: number;
  views: number;
  avatar_url?: string;
}

const STORAGE_URL = "https://sxnxvwdqefmtnnkqldmv.supabase.co/storage/v1/object/public/avatars/";

function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

export default function DirectoryClient({ facultyData }: { facultyData: FacultyMember[] }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [designFilter, setDesignFilter] = useState("All");
  const [activeKeyword, setActiveKeyword] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const depts = useMemo(() => ["All", ...Array.from(new Set(facultyData.map((f) => f.department).filter(Boolean)))], [facultyData]);
  const designations = useMemo(() => [
    "All",
    ...Array.from(new Set(facultyData.map((f) => f.designation).filter(Boolean))),
  ], [facultyData]);

  const dynamicKeywords = useMemo(() => {
    const allKeywords = facultyData.flatMap((f) => f.keywords || []);
    // Count frequencies
    const freq: Record<string, number> = {};
    allKeywords.forEach(kw => {
      freq[kw] = (freq[kw] || 0) + 1;
    });
    // Sort by frequency and then alphabetically
    const uniqueKeywords = Object.keys(freq).sort((a, b) => {
      if (freq[b] !== freq[a]) return freq[b] - freq[a];
      return a.localeCompare(b);
    });
    
    return ["All", ...uniqueKeywords.slice(0, 15)]; // Show top 15 keywords
  }, [facultyData]);

  const filteredFaculty = useMemo(() => {
    return facultyData.filter((member) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        member.name.toLowerCase().includes(q) ||
        member.department.toLowerCase().includes(q) ||
        (member.keywords?.some((kw) => kw.toLowerCase().includes(q)) ?? false);

      const matchDept = deptFilter === "All" || member.department === deptFilter;
      const matchDesign =
        designFilter === "All" || member.designation === designFilter;
      const matchKeyword =
        activeKeyword === "All" || (member.keywords?.includes(activeKeyword) ?? false);

      return matchSearch && matchDept && matchDesign && matchKeyword;
    });
  }, [searchQuery, deptFilter, designFilter, activeKeyword, facultyData]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pt-20 md:px-12 md:pt-24">
      {/* PAGE HEADER */}
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-outline-variant/20 pb-6 md:flex-row md:items-end">
        <div className="text-center md:text-left">
          <h1 className="mb-2 font-headline text-2xl font-extrabold tracking-tighter text-primary md:text-3xl">
            Faculty Directory
          </h1>
          <p className="font-body text-xs text-secondary md:text-sm">
            Fr. Conceicao Rodrigues College of Engineering, Mumbai
          </p>
        </div>

        <div className="flex w-full md:w-fit overflow-hidden rounded-md border border-outline-variant/30 bg-surface-container-lowest">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors md:flex-none md:text-[15px] ${
              viewMode === "grid"
                ? "bg-primary-container text-on-primary-container"
                : "bg-transparent text-secondary hover:bg-surface-container-low"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors md:flex-none md:text-[15px] ${
              viewMode === "list"
                ? "bg-primary-container text-on-primary-container"
                : "bg-transparent text-secondary hover:bg-surface-container-low"
            }`}
          >
            List
          </button>
        </div>
      </header>

      {/* SEARCH AND FILTERS */}
      <section className="mb-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, department, research area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-outline-variant/50 bg-surface px-10 py-2.5 text-sm font-body text-primary outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full rounded-md border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm font-body text-primary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm md:w-[200px]"
          >
            {depts.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "All" ? "All Departments" : dept}
              </option>
            ))}
          </select>
          <select
            value={designFilter}
            onChange={(e) => setDesignFilter(e.target.value)}
            className="w-full rounded-md border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm font-body text-primary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm md:w-[200px]"
          >
            {designations.map((designation) => (
              <option key={designation} value={designation}>
                {designation === "All" ? "All Designations" : designation}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-2 font-label text-[10px] font-semibold uppercase tracking-widest text-outline md:text-[11px]">
            Keywords:
          </span>
          <div className="flex flex-wrap gap-2">
            {dynamicKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setActiveKeyword(kw)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors md:px-4 md:py-1.5 md:text-[14px] ${
                  activeKeyword === kw
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/50 bg-surface-container-lowest text-secondary hover:bg-surface-container-low focus:ring-2 focus:ring-primary/20"
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm font-medium text-secondary">
          Showing{" "}
          <span className="font-bold text-primary">
            {filteredFaculty.length}
          </span>{" "}
          faculty member{filteredFaculty.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* FACULTY DIRECTORY DISPLAY */}
      <section>
        {filteredFaculty.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest">
            <span className="material-symbols-outlined mb-2 text-3xl text-outline">
              search_off
            </span>
            <p className="text-sm font-medium text-secondary">
              No faculty members found matching your search criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                onClick={() => router.push(`/faculty/${member.slug}`)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div className="relative flex h-[100px] items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container-highest">
                  <div
                    className="absolute -bottom-14 flex h-[112px] w-[112px] items-center justify-center rounded-full border-4 border-surface shadow-md overflow-hidden bg-slate-50"
                  >
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url.startsWith('http') ? member.avatar_url : `${STORAGE_URL}${member.avatar_url}`}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized={member.avatar_url?.includes('googleusercontent.com')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                        <span className="text-lg font-bold">{getInitials(member.name)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 pt-16">
                  <div className="mb-2 text-center">
                    <h3 className="font-headline text-[20px] font-extrabold text-primary">
                      {member.name}
                    </h3>
                    <p className="mt-1 font-body text-xs font-medium text-secondary">
                      {member.designation}
                    </p>
                    <p className="font-body text-xs text-outline group-hover:text-primary transition-colors">
                      {member.department}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-4">
                    {member.keywords?.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-surface-container-low px-2 py-1 font-label text-[9px] uppercase tracking-wider text-secondary"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="flex flex-col gap-3">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                onClick={() => router.push(`/faculty/${member.slug}`)}
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full shadow-sm bg-slate-50 border border-slate-100 overflow-hidden relative"
                  >
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url.startsWith('http') ? member.avatar_url : `${STORAGE_URL}${member.avatar_url}`}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized={member.avatar_url?.includes('googleusercontent.com')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                        <span className="text-xs font-bold">{getInitials(member.name)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-headline text-[18px] font-extrabold text-primary transition-colors group-hover:text-blue-600">
                      {member.name}
                    </h3>
                    <p className="font-body text-[13px] text-secondary">
                      {member.designation} • {member.department}
                    </p>
                  </div>
                </div>

                <div className="hidden flex-1 shrink-0 flex-wrap gap-1.5 px-8 md:flex">
                  {member.keywords?.slice(0, 3).map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-surface-container-low px-2 py-1 font-label text-[9px] uppercase tracking-wider text-secondary"
                    >
                      {kw}
                    </span>
                  ))}
                  {(member.keywords?.length ?? 0) > 3 && (
                    <span className="rounded-md bg-surface-container-low px-2 py-1 font-label text-[9px] uppercase tracking-wider text-secondary">
                      +{(member.keywords?.length ?? 0) - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-outline transition-colors group-hover:text-primary">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
