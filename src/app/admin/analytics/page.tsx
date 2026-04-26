"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsDashboardPage() {
  const [activeRange, setActiveRange] = useState<TimeRange>("30d");

  const [topFaculty, setTopFaculty] = useState<any[]>([]);
  const [completionByDept, setCompletionByDept] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [laggards, setLaggards] = useState<any[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalViews: 0, avgCompletion: 0, activeFaculty: 0, totalFaculty: 0, inquiries: 0 });

  useEffect(() => {
    async function loadData() {
      const { data: profiles } = await supabase.from('faculty_profiles').select('*');
      if (!profiles || profiles.length === 0) return;

      const total = profiles.length;
      let active = 0;
      let totalViews = profiles.reduce((acc, f) => acc + (f.views || 0), 0);
      let totalCompletion = 0;

      const deptMap: Record<string, { count: number, sum: number }> = {};
      const statusMap: Record<string, number> = { "approved": 0, "pending_review": 0, "revision": 0, "draft": 0 };
      
      const kwMap: Record<string, number> = {};

      const mappedFac = profiles.map(f => {
        let s = f.profile_status || "draft";
        if (s === "reviewed") s = "approved"; // Legacy mapping
        
        if (["approved", "pending_review", "revision"].includes(s)) active++;
        
        statusMap[s] = (statusMap[s] || 0) + 1;
        totalCompletion += (f.completion || 0);

        const d = f.department || "Unknown";
        if (!deptMap[d]) deptMap[d] = { count: 0, sum: 0 };
        deptMap[d].count++;
        deptMap[d].sum += (f.completion || 0);

        if (Array.isArray(f.keywords)) {
          f.keywords.forEach((k: string) => {
            kwMap[k] = (kwMap[k] || 0) + 1;
          });
        }

        return {
          id: f.id,
          name: f.name || "Untitled",
          initials: (f.name ?? "NA").substring(0, 2).toUpperCase(),
          dept: f.department || "Unknown",
          completion: f.completion || 0,
          views: f.views || 0, // Real views from DB
          trend: "+0%",
          slug: f.id,
          avatarBg: "#F3F4F6",
          avatarText: "#374151"
        };
      });

      // Fetch Inquiries (messages where from_admin is false)
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('from_admin', false)
        .like('body', 'From:%');

      setStats({
        totalViews,
        avgCompletion: Math.round(totalCompletion / total),
        activeFaculty: active,
        totalFaculty: total,
        inquiries: msgCount || 0
      });

      // Top Faculty (Sorted by actual views)
      const sortedByViews = [...mappedFac].sort((a, b) => b.views - a.views);
      setTopFaculty(sortedByViews.slice(0, 7).map((f, i) => ({ ...f, rank: i + 1 })));
      
      // Laggards
      const lag = [...mappedFac].sort((a,b) => a.completion - b.completion).slice(0, 4);
      setLaggards(lag);

      // Dept Completion
      const depts = Object.entries(deptMap).map(([dept, counts]) => ({
        dept,
        pct: counts.count > 0 ? Math.round(counts.sum / counts.count) : 0,
        count: counts.count
      })).sort((a, b) => b.pct - a.pct);
      setCompletionByDept(depts);

      // Status
      setStatusBreakdown([
        { label: `Approved (${statusMap["approved"] || 0})`, pct: ((statusMap["approved"] || 0) / total) * 100, color: "#16A34A" },
        { label: `Pending (${statusMap["pending_review"] || 0})`, pct: ((statusMap["pending_review"] || 0) / total) * 100, color: "#D97706" },
        { label: `Revision (${statusMap["revision"] || 0})`, pct: ((statusMap["revision"] || 0) / total) * 100, color: "#DC2626" },
        { label: `Draft (${statusMap["draft"] || 0})`, pct: ((statusMap["draft"] || 0) / total) * 100, color: "#9CA3AF" },
      ]);

      // Keywords
      const kws = Object.entries(kwMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([kw, freq]) => ({ kw, freq, size: Math.max(10, 10 + freq) }));
      setSearchKeywords(kws);

      // Fetch real monthly activity from audit_log
      const { data: auditData } = await supabase
        .from('audit_log')
        .select('created_at')
        .eq('action', 'submit');
      
      if (auditData) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const activityMap: Record<string, number> = {};
        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          activityMap[months[d.getMonth()]] = 0;
        }

        auditData.forEach(log => {
          const m = months[new Date(log.created_at).getMonth()];
          if (activityMap[m] !== undefined) activityMap[m]++;
        });

        setMonthlyActivity(Object.entries(activityMap).map(([month, value]) => ({ month, value })));
      }
    }
    loadData();
  }, []);

  const handleSendNudge = async (faculty: any) => {
    try {
      const { error } = await supabase.from('messages').insert({
        from_admin: true,
        to_faculty: faculty.id,
        subject: "Action Required: Profile Completion",
        body: `Dear ${faculty.name},\n\nWe noticed your profile completion is at ${faculty.completion}%. Please update your profile with your latest achievements, publications, and certifications.\n\nRegards,\nFPMP Admin`
      });

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor: 'admin',
        action: 'message',
        detail: `Sent completion nudge to ${faculty.name}`
      });

      alert(`Nudge sent to ${faculty.name}`);
    } catch (e) {
      alert("Failed to send nudge");
    }
  };

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 px-6 pt-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-headline text-[22px] font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 font-body text-[14px] text-slate-500">
            Fr. Conceicao Rodrigues College of Engineering
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveRange("7d")}
            className={`cursor-pointer whitespace-nowrap rounded-full border border-slate-300 px-3 py-1.5 font-headline text-[12px] font-semibold transition-colors ${
              activeRange === "7d"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setActiveRange("30d")}
            className={`cursor-pointer whitespace-nowrap rounded-full border border-slate-300 px-3 py-1.5 font-headline text-[12px] font-semibold transition-colors ${
              activeRange === "30d"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setActiveRange("90d")}
            className={`cursor-pointer whitespace-nowrap rounded-full border border-slate-300 px-3 py-1.5 font-headline text-[12px] font-semibold transition-colors ${
              activeRange === "90d"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Last 90 days
          </button>
          <button
            onClick={() => setActiveRange("all")}
            className={`cursor-pointer whitespace-nowrap rounded-full border border-slate-300 px-3 py-1.5 font-headline text-[12px] font-semibold transition-colors ${
              activeRange === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-200 border-l-[3px] border-l-primary bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Profile Views
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            {stats.totalViews}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="font-headline text-[12px] font-semibold text-slate-500">
              Not tracking
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Avg Completion Rate
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            {stats.avgCompletion}%
          </div>
          <div className="mt-1 flex items-center gap-1">
            <TrendingUp size={14} className="text-green-600" />
            <span className="font-headline text-[12px] font-semibold text-green-600">
              Across {stats.totalFaculty} profiles
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Faculty <span className="normal-case opacity-70">(edited)</span>
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            {stats.activeFaculty}
          </div>
          <div className="mt-1 font-body text-[12px] text-slate-500">
            Out of {stats.totalFaculty} total
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Student Messages <span className="normal-case opacity-70">(via profile)</span>
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            {stats.inquiries}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="font-headline text-[12px] font-semibold text-slate-500">
              Not tracking
            </span>
          </div>
        </div>
      </div>

      {/* ROW 1: TWO COLUMN GRID */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-5 lg:grid-cols-2">
        {/* --- LEFT: Top Viewed Faculty --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[15px] font-bold text-slate-900">
              Top Viewed Faculty
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-label text-[11px] font-semibold text-slate-500">
              Last 30 days
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-[13px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Rank
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Faculty
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Views
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Trend
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody>
                {topFaculty.map((f, i) => (
                  <tr
                    key={i}
                    className="group transition-colors hover:bg-slate-50 last:border-0 border-b border-slate-200"
                  >
                    <td className="px-3 py-2.5 align-middle">
                      <div
                        className={`flex h-[20px] w-[20px] items-center justify-center rounded-full font-headline text-[11px] font-bold ${
                          f.rank === 1
                            ? "bg-primary-container text-on-primary-container"
                            : f.rank <= 3
                            ? "bg-slate-100 text-slate-600"
                            : "bg-transparent text-slate-400"
                        }`}
                      >
                        {f.rank}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full font-headline text-[11px] font-bold shadow-sm"
                          style={{
                            backgroundColor: f.avatarBg,
                            color: f.avatarText,
                          }}
                        >
                          {f.initials}
                        </div>
                        <div>
                          <div className="font-headline text-[13px] font-medium text-slate-900 transition-colors group-hover:text-primary">
                            {f.name}
                          </div>
                          <div className="font-body text-[11px] text-slate-500">
                            {f.dept}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle font-headline text-[13px] font-medium text-slate-900">
                      {f.views}
                    </td>
                    <td className="px-3 py-2.5 align-middle font-headline text-[12px] font-semibold">
                      {f.trend.startsWith("+") ? (
                        <span className="text-green-600">↑ {f.trend}</span>
                      ) : (
                        <span className="text-red-600">↓ {f.trend}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <Link
                        href={`/faculty/${f.slug}`}
                        className="font-headline text-[12px] font-bold text-primary transition-colors hover:text-blue-600 hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- RIGHT: Completion by Department --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 font-headline text-[15px] font-bold text-slate-900">
            Completion by Department
          </h3>
          <div className="flex flex-col">
            {completionByDept.map((d, i) => (
              <div key={i} className="mb-[14px] flex items-center gap-[10px]">
                <span className="w-[145px] shrink-0 font-body text-[12px] text-slate-500">
                  {d.dept}
                </span>
                <div className="relative h-[24px] flex-1 overflow-hidden rounded-[4px] bg-slate-100">
                  <div
                    className="flex h-full items-center rounded-[4px] bg-primary transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  >
                    {d.pct > 0 && (
                      <span className="pl-2 font-headline text-[11px] font-bold text-white">
                        {d.pct}%
                      </span>
                    )}
                  </div>
                </div>
                <span className="w-[50px] shrink-0 text-right font-body text-[11px] text-slate-400">
                  {d.count} faculty
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2: THREE COLUMN GRID */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-5 md:grid-cols-2 lg:grid-cols-3">
        {/* --- COL 1: Status Breakdown --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 font-headline text-[15px] font-bold text-slate-900">
            Profile Status Breakdown
          </h3>
          <p className="mb-3 font-body text-[13px] text-slate-500">
            48 Total Faculty
          </p>

          <div className="mb-4 flex h-[20px] w-full overflow-hidden rounded-full font-headline text-xs">
            {statusBreakdown.map((s, i) => (
              <div
                key={i}
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                title={`${s.label}: ${s.pct}%`}
                className="h-full transition-all duration-300 hover:opacity-80"
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {statusBreakdown.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-body text-[12px] text-slate-600">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- COL 2: Monthly Activity --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-headline text-[15px] font-bold text-slate-900">
            Monthly Submissions
          </h3>
          <div className="mb-2 flex h-[120px] items-end gap-1.5 border-b border-slate-200 pb-2">
            {monthlyActivity.map((d, i) => {
              const height = (d.value / 15) * 100; // max value is 15 -> scales to 100px
              return (
                <div
                  key={i}
                  className="group flex flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full rounded-t-[4px] bg-primary transition-colors group-hover:bg-[#FF6D1F]"
                    style={{ height: `${height}px` }}
                    title={`${d.value} submissions`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between px-1">
            {monthlyActivity.map((d, i) => (
              <span
                key={i}
                className="font-label text-[10px] font-semibold uppercase tracking-wider text-slate-400"
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* --- COL 3: Top Search Keywords --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-headline text-[15px] font-bold text-slate-900">
            Top Search Keywords
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {searchKeywords.map((tag, i) => (
              <span
                key={i}
                className="cursor-default rounded-[20px] border border-[#FCD9C0] bg-[#FFF4EE] px-[10px] py-1 font-headline font-semibold text-[#7C2D00] transition-transform hover:-translate-y-0.5"
                style={{ fontSize: `${tag.size}px` }}
                title={`${tag.freq} searches`}
              >
                {tag.kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: COMPLETION LAGGARDS */}
      <div className="px-6 pb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[15px] font-bold text-slate-900">
              Faculty Needing Attention
            </h3>
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-label text-[11px] font-bold uppercase tracking-wider text-red-600">
              Completion {"<"} 50%
            </span>
          </div>

          <div className="flex flex-col">
            {laggards.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-slate-200 py-3 last:border-0"
              >
                <div
                  className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full font-headline text-[12px] font-bold shadow-sm"
                  style={{ backgroundColor: f.avatarBg, color: f.avatarText }}
                >
                  {f.initials}
                </div>
                <div className="flex-1">
                  <div className="font-headline text-[13px] font-medium text-slate-900">
                    {f.name}
                  </div>
                  <div className="font-body text-[11px] text-slate-500">
                    {f.dept}
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-[6px] w-full max-w-[80px] overflow-hidden rounded-[3px] bg-slate-100 hidden sm:block">
                    <div
                      className="h-full rounded-[3px] bg-primary"
                      style={{ width: `${f.completion}%` }}
                    />
                  </div>
                  <span className="font-headline text-[12px] font-medium text-slate-900 hidden sm:block">
                    {f.completion}%
                  </span>
                </div>
                <button
                  onClick={() => handleSendNudge(f)}
                  className="rounded-md border border-[#FCD9C0] bg-[#FFF4EE] px-3 py-1 font-headline text-[12px] font-medium text-primary transition-colors hover:bg-[#FDE8DB]"
                >
                  Send Nudge
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
