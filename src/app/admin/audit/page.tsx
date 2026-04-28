"use client";

import { useState, useMemo, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Download, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { supabase } from "@/lib/supabase";

interface AuditEntry {
  id: string;
  created_at: string;
  actor: string;
  action: string;
  detail: string;
  faculty_profiles?: { name: string } | null;
}

const getTypeBadge = (type: string) => {
  if (!type) return "bg-slate-100 text-slate-600";
  const t = type.toLowerCase();
  switch (t) {
    case "submit":
      return "bg-blue-100 text-blue-900";
    case "approve":
      return "bg-green-100 text-green-900";
    case "revision":
      return "bg-amber-100 text-amber-900";
    case "message":
      return "bg-[#FFF4EE] text-[#7C2D00]";
    case "login":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    async function fetchAuditLog() {
      // Check for session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("No active session found for audit log fetch");
        return;
      }

      const { data, error } = await supabase
        .from("audit_log")
        .select("*, faculty_profiles(name)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Error fetching audit logs:", error);
        return;
      }

      if (data) {
        setLogs(data as any);
      }
    }
    fetchAuditLog();
  }, []);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setActionFilter("All");
    setRoleFilter("All Users");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredLog = useMemo(() => {
    return logs.filter((entry) => {
      const role = entry.actor === "admin" ? "Admin" : "Faculty";
      
      // Role Filter
      if (roleFilter !== "All Users" && role !== roleFilter) return false;

      // Action Type Filter
      if (actionFilter !== "All") {
        if (entry.action?.toLowerCase() !== actionFilter.toLowerCase()) return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const details = entry.detail || "";
        const name = role === "Admin" ? "Admin" : (entry.faculty_profiles?.name || "Unknown");
        const actionStr = entry.action || "";
        
        if (
          !name.toLowerCase().includes(q) &&
          !details.toLowerCase().includes(q) &&
          !actionStr.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Date filtering
      if (dateFrom || dateTo) {
        const entryDate = new Date(entry.created_at);
        if (dateFrom && entryDate < new Date(dateFrom)) return false;
        // set end of day for dateTo
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          if (entryDate > endDate) return false;
        }
      }

      return true;
    });
  }, [logs, actionFilter, roleFilter, searchQuery, dateFrom, dateTo]);

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
      "Details"
    ];
    const rows = filteredLog.map((e) => {
      const name = e.actor === "admin" ? "Admin" : (e.faculty_profiles?.name || "Unknown");
      const role = e.actor === "admin" ? "Admin" : "Faculty";
      return [
        `"${new Date(e.created_at).toLocaleString()}"`,
        `"${name}"`,
        role,
        `"${e.action}"`,
        `"${e.detail || ""}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_log_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
          {logs.length} Total Actions
        </span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-blue-900">
          {logs.filter(l => l.action?.toLowerCase() === "submit").length} Submissions
        </span>
        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-green-900">
          {logs.filter(l => l.action?.toLowerCase() === "approve").length} Approvals
        </span>
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 font-headline text-[12px] font-semibold tracking-wide text-red-700">
          {logs.filter(l => l.action?.toLowerCase() === "revision").length} Revisions Sent
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
        <div className="flex flex-wrap gap-1">
          {["All", "Submit", "Approve", "Message", "Login", "Revision"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setActionFilter(type);
                handleFilterChange();
              }}
              className={`h-[38px] rounded-lg px-4 font-body text-[13px] font-semibold transition-colors ${
                actionFilter === type
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
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
                paginatedLog.map((log) => {
                  const role = log.actor === "admin" ? "Admin" : "Faculty";
                  const name = log.actor === "admin" ? "Admin" : (log.faculty_profiles?.name || "Unknown");
                  const initials = name.substring(0,2).toUpperCase();
                  const actionTypeCap = log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : "Unknown";

                  return (
                    <tr
                      key={log.id}
                      className="group border-b border-slate-200 transition-colors hover:bg-slate-50 last:border-0"
                    >
                      <td className="px-[14px] py-[11px] align-middle font-body text-[12px] text-slate-400 whitespace-nowrap md:table-cell hidden">
                        {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full font-headline text-[10px] font-bold shadow-sm bg-slate-200 text-slate-700"
                          >
                            {initials}
                          </div>
                          <div className="font-headline text-[13px] font-medium text-slate-900">
                            {name}
                          </div>
                        </div>
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        {role === "Admin" ? (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-purple-900">
                            Admin
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-slate-600">
                            Faculty
                          </span>
                        )}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle font-body text-[13px] font-medium text-slate-700">
                        {actionTypeCap}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        <span
                          className={`rounded-full px-2 py-0.5 font-label text-[10px] font-bold tracking-wider ${getTypeBadge(
                            log.action
                          )}`}
                        >
                          {actionTypeCap}
                        </span>
                      </td>
                      <td
                        className="px-[14px] py-[11px] align-middle font-body text-[12px] text-slate-500"
                        title={log.detail}
                      >
                        <div className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {log.detail || "-"}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
