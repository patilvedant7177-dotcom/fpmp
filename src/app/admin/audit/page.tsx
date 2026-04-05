"use client";

import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Download, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface AuditEntry {
  id: number;
  timestamp: string;
  initials: string;
  name: string;
  role: string;
  action: string;
  type: string;
  details: string;
  ip: string;
  avatarBg: string;
  avatarText: string;
}

const auditLog: AuditEntry[] = [
  { id: 1, timestamp: "Apr 3, 2026 · 10:42 AM", initials: "SM", name: "Dr. Swapnali Makdey", role: "Faculty", action: "Submitted profile for review", type: "Submit", details: "Profile v4 submitted — 5 sections modified", ip: "192.168.1.44", avatarBg: "#FFF3ED", avatarText: "#7C2D00" },
  { id: 2, timestamp: "Apr 3, 2026 · 10:30 AM", initials: "AD", name: "Admin", role: "Admin", action: "Sent broadcast message", type: "Message", details: "Broadcast to all 48 faculty — 'Profile Deadline Reminder'", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 3, timestamp: "Apr 2, 2026 · 4:15 PM", initials: "RK", name: "Prof. Rahul Kulkarni", role: "Faculty", action: "Updated publications", type: "Edit", details: "3 journal papers added to profile", ip: "192.168.1.67", avatarBg: "#E0F2FE", avatarText: "#0369A1" },
  { id: 4, timestamp: "Apr 2, 2026 · 2:00 PM", initials: "AD", name: "Admin", role: "Admin", action: "Approved profile — Dr. Anil Rao", type: "Approve", details: "Profile v2 approved and published", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 5, timestamp: "Apr 1, 2026 · 11:30 AM", initials: "AP", name: "Dr. Anita Patil", role: "Faculty", action: "Uploaded CV", type: "Upload", details: "CV_AnitaPatil_2026.pdf — 2.4MB uploaded", ip: "192.168.1.89", avatarBg: "#DCFCE7", avatarText: "#166534" },
  { id: 6, timestamp: "Apr 1, 2026 · 9:00 AM", initials: "AD", name: "Admin", role: "Admin", action: "Sent revision request — Dr. Anita Patil", type: "Revision", details: "Revision requested: Please add FDP certifications from 2024-25", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 7, timestamp: "Mar 31, 2026 · 5:45 PM", initials: "NM", name: "Dr. Ninad More", role: "Faculty", action: "Logged in to faculty portal", type: "Login", details: "Login from Chrome on Windows", ip: "192.168.1.102", avatarBg: "#FCE7F3", avatarText: "#9D174D" },
  { id: 8, timestamp: "Mar 31, 2026 · 3:20 PM", initials: "SM", name: "Dr. Swapnali Makdey", role: "Faculty", action: "Edited profile — About section", type: "Edit", details: "About section updated — 43 words changed", ip: "192.168.1.44", avatarBg: "#FFF3ED", avatarText: "#7C2D00" },
  { id: 9, timestamp: "Mar 30, 2026 · 2:10 PM", initials: "AD", name: "Admin", role: "Admin", action: "Sent direct message — Dr. Anita Patil", type: "Message", details: "Subject: Revision Requested — Please Update Publications", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 10, timestamp: "Mar 30, 2026 · 10:00 AM", initials: "PD", name: "Dr. Priya Desai", role: "Faculty", action: "Submitted profile for review", type: "Submit", details: "Profile v2 submitted — 2 sections modified", ip: "192.168.1.55", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 11, timestamp: "Mar 29, 2026 · 4:50 PM", initials: "AD", name: "Admin", role: "Admin", action: "Approved profile — Dr. Priya Desai", type: "Approve", details: "Profile v2 approved and published", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 12, timestamp: "Mar 29, 2026 · 11:15 AM", initials: "VS", name: "Prof. Vivek Shah", role: "Faculty", action: "Logged in to faculty portal", type: "Login", details: "Login from Safari on iPhone", ip: "192.168.1.78", avatarBg: "#FEF9C3", avatarText: "#854D0E" },
  { id: 13, timestamp: "Mar 28, 2026 · 3:00 PM", initials: "SB", name: "Dr. Sneha Bhat", role: "Faculty", action: "Uploaded CV", type: "Upload", details: "CV_SnehaBhat_Mar2026.pdf — 1.8MB uploaded", ip: "192.168.1.91", avatarBg: "#FDF4FF", avatarText: "#6B21A8" },
  { id: 14, timestamp: "Mar 28, 2026 · 1:45 PM", initials: "VM", name: "Dr. Vijay Mehta", role: "Faculty", action: "Edited profile — Publications", type: "Edit", details: "1 conference paper added", ip: "192.168.1.113", avatarBg: "#FFE4E6", avatarText: "#9F1239" },
  { id: 15, timestamp: "Mar 27, 2026 · 9:30 AM", initials: "AD", name: "Admin", role: "Admin", action: "Rejected profile — Prof. Rohit Naik", type: "Reject", details: "Profile rejected: Insufficient content across all sections", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 16, timestamp: "Mar 26, 2026 · 2:00 PM", initials: "MS", name: "Prof. Meera Sharma", role: "Faculty", action: "Submitted profile for review", type: "Submit", details: "Profile v1 — first submission", ip: "192.168.1.130", avatarBg: "#FEF3C7", avatarText: "#78350F" },
  { id: 17, timestamp: "Mar 25, 2026 · 11:00 AM", initials: "AR", name: "Dr. Anil Rao", role: "Faculty", action: "Updated research keywords", type: "Edit", details: "Keywords updated: added 'NLP', 'Transformer Models'", ip: "192.168.1.22", avatarBg: "#DBEAFE", avatarText: "#1E3A8A" },
  { id: 18, timestamp: "Mar 24, 2026 · 10:15 AM", initials: "SK", name: "Prof. Sunita Kadam", role: "Faculty", action: "Uploaded CV", type: "Upload", details: "CV_SunitaKadam_2026.pdf — 3.1MB uploaded", ip: "192.168.1.88", avatarBg: "#D1FAE5", avatarText: "#065F46" },
  { id: 19, timestamp: "Mar 22, 2026 · 3:30 PM", initials: "AD", name: "Admin", role: "Admin", action: "Sent revision request — Prof. Sunita Kadam", type: "Revision", details: "Revision requested: Please verify publication DOI links", ip: "10.0.0.1", avatarBg: "#EDE9FE", avatarText: "#4C1D95" },
  { id: 20, timestamp: "Mar 20, 2026 · 9:00 AM", initials: "RN", name: "Prof. Rohit Naik", role: "Faculty", action: "Logged in to faculty portal", type: "Login", details: "Login from Firefox on Windows", ip: "192.168.1.145", avatarBg: "#F0FDF4", avatarText: "#166534" },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case "Submit":
      return "bg-blue-100 text-blue-900";
    case "Approve":
      return "bg-green-100 text-green-900";
    case "Revision":
    case "Message":
      return "bg-amber-100 text-amber-900";
    case "Reject":
      return "bg-red-100 text-red-700";
    case "Upload":
      return "bg-purple-100 text-purple-900";
    case "Login":
    case "Edit":
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function AdminAuditLogPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setActionFilter("All Actions");
    setRoleFilter("All Users");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredLog = useMemo(() => {
    return auditLog.filter((entry) => {
      // Role Filter
      if (roleFilter !== "All Users" && entry.role !== roleFilter) return false;

      // Action Type Filter
      if (actionFilter !== "All Actions") {
        const keywordMap: Record<string, string> = {
          "Profile Submit": "Submit",
          "Profile Approve": "Approve",
          "Profile Revision": "Revision",
          "Profile Reject": "Reject",
          "Message Sent": "Message",
          "CV Upload": "Upload",
          "Login": "Login",
          "Profile Edit": "Edit",
        };
        const mappedType = keywordMap[actionFilter];
        if (entry.type !== mappedType) return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        if (
          !entry.name.toLowerCase().includes(q) &&
          !entry.details.toLowerCase().includes(q) &&
          !entry.action.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Date filtering (mock implementation for textual dates)
      // We skip actual Date parsing logic for the mock since it contains string formats like "Apr 3, 2026"
      // If needed fully, we would parse "entry.timestamp".

      return true;
    });
  }, [actionFilter, roleFilter, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredLog.length / rowsPerPage);
  const paginatedLog = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLog.slice(start, start + rowsPerPage);
  }, [filteredLog, currentPage]);

  const exportCSV = () => {
    const headers = [
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Type",
      "Details",
      "IP Address",
    ];
    const rows = filteredLog.map((e) => [
      `"${e.timestamp}"`,
      `"${e.name}"`,
      e.role,
      `"${e.action}"`,
      e.type,
      `"${e.details}"`,
      e.ip,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fpmp-audit-log-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 px-6 pt-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-[22px] font-bold tracking-tight text-slate-900">
            Audit Log
          </h1>
          <p className="mt-1 font-body text-[14px] text-slate-500">
            Complete record of all actions in the system
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 font-headline text-[13px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* STAT CHIPS ROW */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-slate-600">
          247 Total Actions
        </span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-blue-900">
          12 Submissions
        </span>
        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-green-900">
          8 Approvals
        </span>
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-red-700">
          3 Revisions Sent
        </span>
      </div>

      {/* FILTERS ROW */}
      <div className="flex flex-col gap-2.5 px-6 pb-3 md:flex-row md:items-center">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            handleFilterChange();
          }}
          className="h-[38px] w-full max-w-[150px] rounded-lg border border-slate-300 bg-white px-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            handleFilterChange();
          }}
          className="h-[38px] w-full max-w-[150px] rounded-lg border border-slate-300 bg-white px-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            handleFilterChange();
          }}
          className="h-[38px] w-full max-w-[160px] rounded-lg border border-slate-300 bg-white px-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        >
          <option>All Actions</option>
          <option>Profile Submit</option>
          <option>Profile Approve</option>
          <option>Profile Revision</option>
          <option>Profile Reject</option>
          <option>Message Sent</option>
          <option>CV Upload</option>
          <option>Login</option>
          <option>Profile Edit</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            handleFilterChange();
          }}
          className="h-[38px] w-full max-w-[130px] rounded-lg border border-slate-300 bg-white px-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        >
          <option>All Users</option>
          <option>Faculty</option>
          <option>Admin</option>
        </select>
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by user name or action details..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFilterChange();
            }}
            className="h-[38px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between px-6">
        <p className="font-body text-[12px] font-medium text-slate-400">
          Showing {paginatedLog.length} of {filteredLog.length} entries
        </p>
        <button
          onClick={clearFilters}
          className="font-headline text-[12px] font-bold text-primary transition-colors hover:text-blue-600 hover:underline"
        >
          Clear Filters
        </button>
      </div>

      {/* AUDIT TABLE */}
      <div className="mx-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 md:table-cell hidden">
                  Timestamp
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  User
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Role
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Action
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Type
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Details
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 md:table-cell hidden">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLog.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center font-body text-sm text-slate-500"
                  >
                    No audit logs match these filters.
                  </td>
                </tr>
              ) : (
                paginatedLog.map((log) => (
                  <tr
                    key={log.id}
                    className="group border-b border-slate-200 transition-colors hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-[14px] py-[11px] align-middle font-body text-[12px] text-slate-400 whitespace-nowrap md:table-cell hidden">
                      {log.timestamp}
                    </td>
                    <td className="px-[14px] py-[11px] align-middle">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full font-headline text-[10px] font-bold shadow-sm"
                          style={{
                            backgroundColor: log.avatarBg,
                            color: log.avatarText,
                          }}
                        >
                          {log.initials}
                        </div>
                        <div className="font-headline text-[13px] font-medium text-slate-900">
                          {log.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-[14px] py-[11px] align-middle">
                      {log.role === "Admin" ? (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-purple-900">
                          Admin
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-slate-600">
                          Faculty
                        </span>
                      )}
                    </td>
                    <td className="px-[14px] py-[11px] align-middle font-body text-[13px] text-slate-900">
                      {log.action}
                    </td>
                    <td className="px-[14px] py-[11px] align-middle">
                      <span
                        className={`rounded-full px-2 py-0.5 font-label text-[10px] font-bold tracking-wider ${getTypeBadge(
                          log.type
                        )}`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td
                      className="px-[14px] py-[11px] align-middle font-body text-[12px] text-slate-500"
                      title={log.details}
                    >
                      <div className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {log.details}
                      </div>
                    </td>
                    <td className="px-[14px] py-[11px] align-middle font-mono text-[11px] text-slate-400 md:table-cell hidden">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-6 pb-8">
        <p className="font-body text-[12px] font-medium text-slate-400">
          Showing{" "}
          {filteredLog.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
          {Math.min(currentPage * rowsPerPage, filteredLog.length)} of{" "}
          {filteredLog.length} entries
        </p>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-[28px] w-[28px] items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(Math.max(1, totalPages))].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`flex h-[28px] w-[28px] items-center justify-center rounded-md font-headline text-[13px] font-bold transition-all ${
                currentPage === i + 1
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-[28px] w-[28px] items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
