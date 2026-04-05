"use client";

import Link from "next/link";
import FacultyLayout from "@/components/faculty/FacultyLayout";

const sectionsStatus = [
  { name: "Basic Info", status: "Done" },
  { name: "About/Overview", status: "Done" },
  { name: "Education", status: "Done" },
  { name: "Publications", status: "Done" },
  { name: "Research Keywords", status: "Done" },
  { name: "Awards", status: "Partial" },
  { name: "Certifications/FDPs", status: "Empty" },
  { name: "Invited Talks", status: "Empty" },
  { name: "Social Links", status: "Empty" },
];

const statsData = {
  distribution: [
    { label: "Journals", percentage: 55, color: "#E8580A", actualCount: 15 },
    { label: "Conferences", percentage: 30, color: "#2563EB", actualCount: 8 },
    { label: "Invited Talks", percentage: 15, color: "#16A34A", actualCount: 4 },
  ],
  outputByYear: [
    { year: "2021", count: 2 },
    { year: "2022", count: 3 },
    { year: "2023", count: 5 },
    { year: "2024", count: 4 },
    { year: "2025", count: 9 },
    { year: "2026", count: 1 },
  ]
};

const StatusBadge = ({ status }: { status: "Done" | "Partial" | "Empty" }) => {
  if (status === "Done") {
    return (
      <span className="rounded bg-green-100 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-green-800">
        Done
      </span>
    );
  }
  if (status === "Partial") {
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-amber-800">
        Partial
      </span>
    );
  }
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-slate-600">
      Empty
    </span>
  );
};

export default function DashboardPage() {
  return (
    <FacultyLayout>
      {/* ANNOUNCEMENT BAR */}
      <div className="mx-6 mt-6 flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-secondary-container/30 px-4 py-3">
        <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        <p className="font-body text-[13px] font-medium text-secondary">
          Admin Notice: Please update your profile with latest publications and
          certifications before 31st March 2026.
        </p>
      </div>

      {/* PAGE HEADER */}
      <div className="px-6 pt-6">
        <h1 className="font-headline text-[22px] font-bold tracking-tight text-primary">
          Welcome back, Dr. Makdey
        </h1>
        <p className="mt-1 font-body text-[14px] text-secondary">
          Your profile is currently under review
        </p>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Profile Completion */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 border-l-[3px] border-l-primary bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-outline">
            Profile Completion
          </div>
          <div className="font-headline text-[28px] font-bold text-primary">
            78%
          </div>
          <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full w-[78%] rounded-full bg-primary" />
          </div>
        </div>

        {/* Card 2: Profile Status */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-outline">
            Profile Status
          </div>
          <div>
            <span className="inline-block rounded-md bg-amber-100 px-2.5 py-1 font-label text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Pending Review
            </span>
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-secondary">
            Since 2 days ago
          </div>
        </div>

        {/* Card 3: Public Views */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-outline">
            Public Views
          </div>
          <div className="font-headline text-[28px] font-bold text-primary">
            142
          </div>
          <div className="mt-auto font-body text-[12px] text-secondary">
            Last 30 days
          </div>
        </div>

        {/* Card 4: Unread Messages */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-outline">
            Unread Messages
          </div>
          <div className="font-headline text-[28px] font-bold text-primary">
            2
          </div>
          <div className="mt-auto font-body text-[12px] text-secondary">
            From admin
          </div>
        </div>
      </div>

      {/* ACADEMIC IMPACT & OUTPUT (FROM PUBLIC PROFILE) */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Research Footprint Donut */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm flex flex-col items-center">
            <h3 className="font-headline text-[15px] font-bold text-primary w-full mb-6">Research Footprint</h3>
            <div className="relative h-[160px] w-[160px] rounded-full overflow-hidden mb-6" style={{
              background: `conic-gradient(#E8580A 0% 55%, #2563EB 55% 85%, #16A34A 85% 100%)`
            }}>
              <div className="absolute inset-0 m-auto h-[110px] w-[110px] rounded-full bg-surface-container-lowest flex flex-col items-center justify-center shadow-inner">
                <span className="font-headline text-[28px] font-bold text-primary leading-none">27</span>
                <span className="font-label text-[9px] uppercase font-bold text-outline mt-1 tracking-widest">Items</span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-3">
              {statsData.distribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between font-body text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="h-[10px] w-[10px] rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-secondary font-medium">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-outline">{d.actualCount}</span>
                    <span className="font-bold text-primary w-8 text-right">{d.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Output */}
          <div className="lg:col-span-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm flex flex-col">
            <h3 className="font-headline text-[15px] font-bold text-primary mb-6">Publication Output</h3>
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 h-[180px] w-full border-b border-outline-variant/30 pb-3">
              {statsData.outputByYear.map((d, i) => {
                const max = Math.max(...statsData.outputByYear.map(x => x.count));
                const heightPct = (d.count / max) * 100;
                const finalHeight = Math.max(heightPct, 5); 
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full gap-2 group flex-1">
                    <span className="font-headline text-[13px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">{d.count}</span>
                    <div className="w-full max-w-[48px] bg-primary-container disabled-lighten rounded-t-lg group-hover:bg-primary transition-all duration-300 relative overflow-hidden" style={{ height: `${finalHeight}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
                    </div>
                    <span className="font-label text-[10px] font-bold text-outline uppercase tracking-wider">{d.year}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
        {/* --- LEFT CARD: Profile Completion Details --- */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h3 className="font-headline text-[15px] font-bold text-primary">
              Profile Completion
            </h3>
            <span className="font-headline text-[15px] font-bold text-primary">
              78%
            </span>
          </div>
          <div className="flex flex-col">
            {sectionsStatus.map((section, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-outline-variant/20 py-2.5 last:border-0"
              >
                <span className="font-body text-[13px] font-medium text-secondary">
                  {section.name}
                </span>
                <StatusBadge status={section.status as any} />
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN (Two stacked cards) --- */}
        <div className="flex flex-col gap-6">
          {/* TOP: AI Smart Nudges */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-headline text-[15px] font-bold text-primary">
              <span className="material-symbols-outlined text-[18px] text-primary">
                tips_and_updates
              </span>
              AI Smart Nudges
            </h3>

            {/* Nudge 1 */}
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h4 className="mb-1 font-headline text-[13px] font-bold text-blue-900">
                Add your Certifications & FDPs
              </h4>
              <p className="font-body text-[12px] text-blue-800/80">
                You have 13+ certifications in your CV. Faculty with complete
                records appear higher in search results.
              </p>
            </div>

            {/* Nudge 2 */}
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h4 className="mb-1 font-headline text-[13px] font-bold text-blue-900">
                Link your Google Scholar profile
              </h4>
              <p className="font-body text-[12px] text-blue-800/80">
                Connect Scholar to auto-sync your publications. Takes 30
                seconds.
              </p>
            </div>

            {/* Nudge 3 */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <h4 className="mb-1 font-headline text-[13px] font-bold text-green-900">
                Your about section looks great!
              </h4>
              <p className="font-body text-[12px] text-green-800/80">
                Well-written overview will improve student engagement
                significantly.
              </p>
            </div>
          </div>

          {/* BOTTOM: Recent Messages */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="flex items-center gap-2 font-headline text-[15px] font-bold text-primary">
                Recent Messages
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-label text-[10px] font-bold text-on-primary">
                  2
                </span>
              </h3>
            </div>

            {/* Message 1 */}
            <div className="mb-3 flex items-start gap-3 rounded-lg bg-secondary-container/20 p-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <h4 className="font-headline text-[13px] font-bold text-primary">
                  Profile Review — Action Required
                </h4>
                <p className="mt-0.5 font-body text-[12px] text-secondary">
                  Please add your FDP certifications from 2024-25...
                </p>
                <p className="mt-1 font-label text-[10px] uppercase tracking-wide text-outline">
                  Admin · 2 hours ago
                </p>
              </div>
            </div>

            {/* Message 2 */}
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-secondary-container/20 p-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <h4 className="font-headline text-[13px] font-bold text-primary">
                  Broadcast: Profile Deadline Reminder
                </h4>
                <p className="mt-0.5 font-body text-[12px] text-secondary">
                  All faculty must submit by 31st March 2026...
                </p>
                <p className="mt-1 font-label text-[10px] uppercase tracking-wide text-outline">
                  Admin · 1 day ago
                </p>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/faculty/messages"
                className="font-headline text-[12px] font-bold text-primary transition-colors hover:text-blue-600 hover:underline"
              >
                View all messages
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-3 px-6 pb-10">
        <Link
          href="/faculty/editor"
          className="rounded-lg bg-primary px-5 py-2.5 font-headline text-[13px] font-bold text-on-primary shadow-sm transition-opacity hover:opacity-90 active:scale-95"
        >
          Edit Profile
        </Link>
        <Link
          href="/faculty/cv-upload"
          className="rounded-lg border border-outline-variant bg-surface-container px-5 py-2.5 font-headline text-[13px] font-medium text-secondary shadow-sm transition-colors hover:bg-surface-container-high hover:text-primary active:scale-95"
        >
          Upload CV
        </Link>
        <Link
          href="/faculty/swapnali-makdey"
          className="rounded-lg border border-outline-variant bg-surface-container px-5 py-2.5 font-headline text-[13px] font-medium text-secondary shadow-sm transition-colors hover:bg-surface-container-high hover:text-primary active:scale-95"
        >
          Preview Public Profile
        </Link>
      </div>
    </FacultyLayout>
  );
}
