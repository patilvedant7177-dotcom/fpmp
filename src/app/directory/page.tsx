"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";

interface FacultyMember {
  id: string;
  slug: string;
  initials: string;
  name: string;
  designation: string;
  dept: string;
  keywords: string[];
  status: "approved" | "pending" | "draft";
  completion: number;
  views: number;
  avatarBg: string;
  avatarText: string;
}

const facultyData: FacultyMember[] = [
  {
    id: "1",
    slug: "swapnali-makdey",
    initials: "SM",
    name: "Dr. Swapnali Makdey",
    designation: "Head of Department",
    dept: "Electronics & CS",
    keywords: ["VLSI", "Machine Learning", "Analog VLSI"],
    status: "approved",
    completion: 78,
    views: 142,
    avatarBg: "#FFF3ED",
    avatarText: "#7C2D00",
  },
  {
    id: "2",
    slug: "rahul-kulkarni",
    initials: "RK",
    name: "Prof. Rahul Kulkarni",
    designation: "Associate Professor",
    dept: "Computer Engineering",
    keywords: ["IoT", "Networking", "Cloud Computing"],
    status: "approved",
    completion: 92,
    views: 89,
    avatarBg: "#E0F2FE",
    avatarText: "#0369A1",
  },
  {
    id: "3",
    slug: "anita-patil",
    initials: "AP",
    name: "Dr. Anita Patil",
    designation: "Professor",
    dept: "Electronics & CS",
    keywords: ["Embedded Systems", "VLSI", "Microcontrollers"],
    status: "approved",
    completion: 55,
    views: 34,
    avatarBg: "#DCFCE7",
    avatarText: "#166534",
  },
  {
    id: "4",
    slug: "ninad-more",
    initials: "NM",
    name: "Dr. Ninad More",
    designation: "Associate Professor",
    dept: "Electronics & CS",
    keywords: ["Machine Learning", "Data Science", "Deep Learning"],
    status: "approved",
    completion: 85,
    views: 67,
    avatarBg: "#FCE7F3",
    avatarText: "#9D174D",
  },
  {
    id: "5",
    slug: "vivek-shah",
    initials: "VS",
    name: "Prof. Vivek Shah",
    designation: "Assistant Professor",
    dept: "Mechanical",
    keywords: ["CAD", "FEM", "Thermodynamics"],
    status: "draft",
    completion: 22,
    views: 0,
    avatarBg: "#FEF9C3",
    avatarText: "#854D0E",
  },
  {
    id: "6",
    slug: "priya-desai",
    initials: "PD",
    name: "Dr. Priya Desai",
    designation: "Professor",
    dept: "Civil",
    keywords: ["Structural Analysis", "GIS", "Concrete Design"],
    status: "approved",
    completion: 68,
    views: 41,
    avatarBg: "#EDE9FE",
    avatarText: "#4C1D95",
  },
];

const KEYWORDS_LIST = [
  "All",
  "VLSI",
  "Machine Learning",
  "IoT",
  "Embedded Systems",
  "Data Science",
  "Networking",
];

export default function DirectoryPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [designFilter, setDesignFilter] = useState("All");
  const [activeKeyword, setActiveKeyword] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const depts = ["All", ...Array.from(new Set(facultyData.map((f) => f.dept)))];
  const designations = [
    "All",
    ...Array.from(new Set(facultyData.map((f) => f.designation))),
  ];

  const filteredFaculty = useMemo(() => {
    return facultyData.filter((member) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        member.name.toLowerCase().includes(q) ||
        member.dept.toLowerCase().includes(q) ||
        member.keywords.some((kw) => kw.toLowerCase().includes(q));

      const matchDept = deptFilter === "All" || member.dept === deptFilter;
      const matchDesign =
        designFilter === "All" || member.designation === designFilter;
      const matchKeyword =
        activeKeyword === "All" || member.keywords.includes(activeKeyword);

      return matchSearch && matchDept && matchDesign && matchKeyword;
    });
  }, [searchQuery, deptFilter, designFilter, activeKeyword]);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      {/* NAVBAR */}
      <PublicNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 pt-24 md:px-12">
        {/* PAGE HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-outline-variant/20 pb-6 md:flex-row md:items-end">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Home
            </Link>
            <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-tighter text-primary">
              Faculty Directory
            </h1>
            <p className="font-body text-sm text-secondary">
              Fr. Conceicao Rodrigues College of Engineering, Mumbai
            </p>
          </div>

          <div className="flex w-fit overflow-hidden rounded-md border border-outline-variant/30 bg-surface-container-lowest">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-transparent text-secondary hover:bg-surface-container-low"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
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
            <span className="mr-2 font-label text-[11px] font-semibold uppercase tracking-widest text-outline">
              Keywords:
            </span>
            {KEYWORDS_LIST.map((kw) => (
              <button
                key={kw}
                onClick={() => setActiveKeyword(kw)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeKeyword === kw
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/50 bg-surface-container-lowest text-secondary hover:bg-surface-container-low focus:ring-2 focus:ring-primary/20"
                }`}
              >
                {kw}
              </button>
            ))}
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
                      className="absolute -bottom-8 flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-surface shadow-md overflow-hidden bg-slate-50"
                    >
                      <ImageIcon className="text-slate-300 w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6 pt-12">
                    <div className="mb-2 text-center">
                      <h3 className="font-headline text-lg font-bold text-primary">
                        {member.name}
                      </h3>
                      <p className="mt-1 font-body text-xs font-medium text-secondary">
                        {member.designation}
                      </p>
                      <p className="font-body text-xs text-outline group-hover:text-primary transition-colors">
                        {member.dept}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-4">
                      {member.keywords.slice(0, 3).map((kw, i) => (
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
                      className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full shadow-sm bg-slate-50 border border-slate-100 overflow-hidden"
                    >
                      <ImageIcon className="text-slate-300 w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="font-headline text-[15px] font-bold text-primary transition-colors group-hover:text-blue-600">
                        {member.name}
                      </h3>
                      <p className="font-body text-[13px] text-secondary">
                        {member.designation} • {member.dept}
                      </p>
                    </div>
                  </div>

                  <div className="hidden flex-1 shrink-0 flex-wrap gap-1.5 px-8 md:flex">
                    {member.keywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-surface-container-low px-2 py-1 font-label text-[9px] uppercase tracking-wider text-secondary"
                      >
                        {kw}
                      </span>
                    ))}
                    {member.keywords.length > 3 && (
                      <span className="rounded-md bg-surface-container-low px-2 py-1 font-label text-[9px] uppercase tracking-wider text-secondary">
                        +{member.keywords.length - 3}
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
