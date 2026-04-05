"use client";

import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Image as ImageIcon } from "lucide-react";

// --- MOCK DATA ---
const departmentsData = [
  { dept: "Electronics & CS", pct: 88 },
  { dept: "Computer Engineering", pct: 72 },
  { dept: "Electronics", pct: 79 },
  { dept: "Mechanical", pct: 61 },
  { dept: "Civil", pct: 55 },
  { dept: "Information Tech", pct: 45 },
];

const activityData = [
  {
    dot: "#16A34A",
    text: "Dr. Makdey submitted profile for review",
    time: "2 hours ago",
  },
  {
    dot: "#2563EB",
    text: "Prof. Sharma updated publications (3 added)",
    time: "5 hours ago",
  },
  {
    dot: "#D97706",
    text: "Admin sent broadcast to all faculty",
    time: "1 day ago",
  },
  {
    dot: "#16A34A",
    text: "Dr. Rao profile approved and published",
    time: "1 day ago",
  },
  {
    dot: "#DC2626",
    text: "Prof. Mehta profile sent for revision",
    time: "2 days ago",
  },
];

interface FacultyRow {
  id: string;
  initials: string;
  name: string;
  desig: string;
  dept: string;
  status: "approved" | "pending" | "revision" | "draft";
  completion: number;
  updated: string;
  views: number;
  avatarBg: string;
  avatarText: string;
}

const facultyData: FacultyRow[] = [
  {
    id: "1",
    initials: "SM",
    name: "Dr. Swapnali Makdey",
    desig: "Head of Department",
    dept: "Electronics & CS",
    status: "pending",
    completion: 78,
    updated: "2 hrs ago",
    views: 142,
    avatarBg: "#FFF3ED",
    avatarText: "#7C2D00",
  },
  {
    id: "2",
    initials: "RK",
    name: "Prof. Rahul Kulkarni",
    desig: "Associate Professor",
    dept: "Computer Engineering",
    status: "approved",
    completion: 92,
    updated: "3 days ago",
    views: 89,
    avatarBg: "#E0F2FE",
    avatarText: "#0369A1",
  },
  {
    id: "3",
    initials: "AP",
    name: "Dr. Anita Patil",
    desig: "Professor",
    dept: "Electronics & CS",
    status: "revision",
    completion: 55,
    updated: "5 days ago",
    views: 34,
    avatarBg: "#DCFCE7",
    avatarText: "#166534",
  },
  {
    id: "4",
    initials: "NM",
    name: "Dr. Ninad More",
    desig: "Associate Professor",
    dept: "Electronics & CS",
    status: "approved",
    completion: 85,
    updated: "1 week ago",
    views: 67,
    avatarBg: "#FCE7F3",
    avatarText: "#9D174D",
  },
  {
    id: "5",
    initials: "VS",
    name: "Prof. Vivek Shah",
    desig: "Assistant Professor",
    dept: "Mechanical",
    status: "draft",
    completion: 22,
    updated: "2 weeks ago",
    views: 0,
    avatarBg: "#FEF9C3",
    avatarText: "#854D0E",
  },
];

const StatusBadge = ({ status }: { status: FacultyRow["status"] }) => {
  switch (status) {
    case "approved":
      return (
        <span className="rounded-full bg-green-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-green-800">
          Approved
        </span>
      );
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
      return (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-slate-600">
          Draft
        </span>
      );
  }
};

export default function AdminDashboardPage() {
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

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 border-l-[3px] border-l-primary bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Faculty
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            48
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-slate-500">
            Across 6 departments
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Approved Profiles
          </div>
          <div className="font-headline text-[28px] font-bold text-green-600">
            31
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-slate-500">
            64% of total
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pending Review
          </div>
          <div className="font-headline text-[28px] font-bold text-amber-500">
            9
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
            5
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
          <div className="flex flex-col">
            {departmentsData.map((d, i) => (
              <div key={i} className="mb-2.5 flex items-center gap-3">
                <span className="w-[140px] shrink-0 font-body text-[12px] text-slate-500">
                  {d.dept}
                </span>
                <div className="relative h-[22px] flex-1 overflow-hidden rounded-[3px] bg-slate-100">
                  <div
                    className="flex h-full items-center rounded-[3px] bg-primary transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  >
                    {d.pct > 0 && (
                      <span className="pl-2 font-label text-[11px] font-bold text-white">
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
          <h3 className="mb-4 font-headline text-[15px] font-bold text-slate-900">
            Announcement Manager
          </h3>

          <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary-container/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <p className="font-body text-[13px] font-medium text-[#7C2D00]">
                All faculty must submit updated profiles before 31st March 2026.
              </p>
            </div>
            <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-green-800">
              Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-md border border-slate-300 px-4 py-1.5 font-headline text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
              Edit Announcement
            </button>
            <button className="rounded-md bg-red-50 px-4 py-1.5 font-headline text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-100">
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
