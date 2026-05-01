"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Image as ImageIcon, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FacultyRow {
  id: string;
  initials: string;
  name: string;
  desig: string;
  dept: string;
  status: "approved" | "pending_review" | "revision" | "draft" | string;
  completion: number;
  updated: string;
  views: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "approved":
      return (
        <span className="rounded-full bg-green-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-green-800">
          Approved
        </span>
      );
    case "pending_review":
    case "pending":
      return (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Pending Review
        </span>
      );
    case "revision":
      return (
        <span className="rounded-full bg-red-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-red-800">
          Needs Revision
        </span>
      );
    case "draft":
    default:
      return (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-slate-600">
          Draft
        </span>
      );
  }
};

export default function AdminDashboardPage() {
  const [facultyData, setFacultyData] = useState<FacultyRow[]>([]);
  const [departmentsData, setDepartmentsData] = useState<{ dept: string; pct: number }[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, revision: 0 });

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch Faculty
      const { data: facultyRaw } = await supabase.from('faculty_profiles').select('*');
      const profiles = facultyRaw || [];
      
      const total = profiles.length;
      let app = 0, pen = 0, rev = 0;
      const deptMap: Record<string, { total: number; sum: number }> = {};

      const formattedFaculty = profiles.map(f => {
        let status = f.profile_status || "draft";
        if (status === "reviewed") status = "approved";
        
        if (status === "approved") app++;
        if (status === "pending_review") pen++;
        if (status === "revision") rev++;

        const dept = f.department || "Unknown";
        if (!deptMap[dept]) deptMap[dept] = { total: 0, sum: 0 };
        deptMap[dept].total++;
        deptMap[dept].sum += (f.completion || 0);

        return {
          id: f.id,
          initials: (f.name ?? "NA").substring(0, 2).toUpperCase(),
          name: f.name || "Untitled Profile",
          desig: f.designation || "Unknown",
          dept: f.department || "Unknown",
          status,
          completion: f.completion || 0,
          updated: new Date(f.updated_at || f.created_at || Date.now()).toLocaleDateString(),
          views: 0
        };
      });

      setStats({ total, approved: app, pending: pen, revision: rev });
      setFacultyData(formattedFaculty.slice(0, 5)); // show only top 5 recent

      const depts = Object.entries(deptMap).map(([dept, counts]) => ({
        dept,
        pct: counts.total > 0 ? Math.round(counts.sum / counts.total) : 0
      }));
      setDepartmentsData(depts);

      // Fetch Recent Activity (audit_log)
      const { data: auditLog } = await supabase.from('audit_log').select('*, faculty_profiles(name)').order('created_at', { ascending: false }).limit(5);
      if (auditLog) {
        const activities = auditLog.map(log => {
          let dot = "#6B7280";
          const action = log.action?.toLowerCase() || "";
          if (action.includes("submit")) dot = "#2563EB";
          if (action.includes("approve")) dot = "#16A34A";
          if (action.includes("revision") || action.includes("reject")) dot = "#DC2626";
          if (action.includes("message") || action.includes("broadcast")) dot = "#D97706";
          
          let actorName = log.actor === "admin" ? "Admin" : (log.faculty_profiles?.name || "Faculty");
          
          return {
            dot,
            text: `${actorName} ${log.detail || log.action}`,
            time: new Date(log.created_at).toLocaleString()
          };
        });
        setActivityData(activities);
      }

      // Fetch Announcements
      const { data: ann } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (ann) {
        setAnnouncements(ann);
      }
    }
    fetchDashboardData();
  }, []);

  const [isNewAnnModalOpen, setIsNewAnnModalOpen] = useState(false);
  const [newAnnMessage, setNewAnnMessage] = useState("");
  const [isAddingAnn, setIsAddingAnn] = useState(false);

  const handleAddAnnouncement = async () => {
    if (!newAnnMessage.trim()) return;
    setIsAddingAnn(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({ message: newAnnMessage, is_active: true })
        .select();
      
      if (error) throw error;
      
      if (data) {
        setAnnouncements([data[0], ...announcements]);
        setNewAnnMessage("");
        setIsNewAnnModalOpen(false);
      }
    } catch (e) {
      alert("Failed to add announcement");
    } finally {
      setIsAddingAnn(false);
    }
  };
  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="px-6 pt-6">
        <h1 className="font-headline text-[22px] font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 font-body text-[14px] text-slate-500">
          Fr. Conceicao Rodrigues College of Engineering
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-[3px] border-l-primary bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Faculty
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            {stats.total}
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-slate-500">
            Across {departmentsData.length} departments
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Approved Profiles
          </div>
          <div className="font-headline text-[28px] font-bold text-green-600">
            {stats.approved}
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-slate-500">
            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of total
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pending Review
          </div>
          <div className="font-headline text-[28px] font-bold text-amber-500">
            {stats.pending}
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-slate-500">
            Awaiting approval
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Needs Revision
          </div>
          <div className="font-headline text-[28px] font-bold text-red-600">
            {stats.revision}
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-slate-500">
            Sent back to faculty
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
        {/* --- LEFT CARD: Department Completion Chart --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 font-headline text-[15px] font-bold text-slate-900">
            Department Completion
          </h3>
          <div className="flex flex-col gap-3">
            {departmentsData.map((d, i) => (
              <div key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="w-full shrink-0 font-body text-[12px] text-slate-500 sm:w-[140px]">
                  {d.dept}
                </span>
                <div className="relative h-[22px] flex-1 overflow-hidden rounded-[4px] bg-slate-100">
                  <div
                    className="flex h-full items-center rounded-[4px] bg-primary transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  >
                    {d.pct > 0 && (
                      <span className="pl-2 font-label text-[10px] font-bold text-white md:text-[11px]">
                        {d.pct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT CARD: Recent Activity Feed --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-headline text-[15px] font-bold text-slate-900">
            Recent Activity
          </h3>
          <div className="flex flex-col">
            {activityData.map((activity, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-slate-200 py-2.5 last:border-0"
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: activity.dot }}
                />
                <div className="flex-1">
                  <p className="font-body text-[13px] text-slate-900">
                    {activity.text}
                  </p>
                  <p className="mt-0.5 font-label text-[11px] uppercase tracking-wide text-slate-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FACULTY TABLE ROW */}
      <div className="px-6 pb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[15px] font-bold text-slate-900">
              Faculty Overview
            </h3>
            <Link
              href="/admin/faculty"
              className="font-headline text-[12px] font-bold text-primary transition-colors hover:text-blue-600"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-[13px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2.5 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Faculty
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2.5 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Department
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2.5 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2.5 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Completion
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2.5 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Last Updated
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2.5 text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {facultyData.map((f) => (
                  <tr
                    key={f.id}
                    className="group border-b border-slate-200 transition-colors hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-sm overflow-hidden"
                        >
                          <ImageIcon className="text-slate-300 w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-headline text-[13px] font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {f.name}
                          </div>
                          <div className="font-body text-[11px] text-slate-500">
                            {f.desig}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle font-body text-slate-500">
                      {f.dept}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-[6px] w-[60px] overflow-hidden rounded-[3px] bg-slate-100">
                          <div
                            className="h-full rounded-[3px] bg-primary"
                            style={{ width: `${f.completion}%` }}
                          />
                        </div>
                        <span className="font-body text-[12px] text-slate-500">
                          {f.completion}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle font-body text-slate-500">
                      {f.updated}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      {f.status === "pending" || f.status === "revision" ? (
                        <Link
                          href={`/admin/approval/${f.id}`}
                          className="rounded-[6px] border border-slate-300 px-3 py-1 font-headline text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 inline-block"
                        >
                          Review
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/approval/${f.id}`}
                          className="rounded-[6px] border border-slate-300 px-3 py-1 font-headline text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 inline-block"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT MANAGER */}
      <div className="px-6 pb-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[15px] font-bold text-slate-900">
              Announcement Manager
            </h3>
            <button 
              onClick={() => setIsNewAnnModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-headline text-[13px] font-semibold text-white shadow-sm hover:opacity-90"
            >
              <Plus size={14} /> New
            </button>
          </div>

          {announcements.length === 0 ? (
            <p className="text-sm font-body text-slate-500">No active announcements right now.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary-container/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="font-body text-[13px] font-medium text-[#7C2D00]">
                      {ann.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-green-800">
                      Active
                    </span>
                    <button 
                      className="rounded-md bg-red-50 px-3 py-1 font-headline text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100" 
                      onClick={async () => {
                        await supabase.from('announcements').update({ is_active: false }).eq('id', ann.id);
                        setAnnouncements(announcements.filter(a => a.id !== ann.id));
                      }}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW ANNOUNCEMENT MODAL */}
      {isNewAnnModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm transition-all animate-in fade-in sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom sm:rounded-2xl sm:zoom-in-95 duration-200">
            <h3 className="mb-4 font-headline text-[18px] font-bold text-slate-900">
              New Announcement
            </h3>
            <p className="mb-4 font-body text-[14px] text-slate-500">
              This message will be broadcasted to all faculty members on their dashboard.
            </p>
            <textarea
              value={newAnnMessage}
              onChange={(e) => setNewAnnMessage(e.target.value)}
              placeholder="Type your announcement here..."
              rows={4}
              className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-body text-[14px] text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                onClick={() => setIsNewAnnModalOpen(false)}
                className="w-full rounded-lg px-4 py-2 font-headline text-[14px] font-bold text-slate-500 hover:bg-slate-100 transition-colors sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAnnouncement}
                disabled={isAddingAnn || !newAnnMessage.trim()}
                className="w-full rounded-lg bg-primary px-6 py-2 font-headline text-[14px] font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 sm:w-auto"
              >
                {isAddingAnn ? "Posting..." : "Post Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
