"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
  Download,
  X,
  Search,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

interface FacultyRow {
  id: string;
  initials: string;
  name: string;
  desig: string;
  dept: string;
  status: string;
  completion: number;
  views: number;
  updated: string;
  avatarBg: string;
  avatarText: string;
}

const StatusBadge = ({ status }: { status: string }) => {
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

type SortColumn = "name" | "dept" | "desig" | "status" | "completion" | "views";
type SortDirection = "asc" | "desc";

export default function AdminFacultyPage() {
  const [facultyData, setFacultyData] = useState<FacultyRow[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, revision: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [designFilter, setDesignFilter] = useState("All Designations");

  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('faculty_profiles').select('*');
      if (!data) return;

      let app = 0, pen = 0, rev = 0;
      
      const mapped = data.map((f: any) => {
        const s = f.profile_status || "draft";
        if (s === "approved") app++;
        if (s === "pending_review") pen++;
        if (s === "revision") rev++;

        return {
          id: f.id,
          initials: (f.name ?? "NA").substring(0, 2).toUpperCase(),
          name: f.name || "Untitled",
          desig: f.designation || "Unknown",
          dept: f.department || "Unknown",
          status: s,
          completion: f.completion || 0,
          views: f.views || 0,
          updated: new Date(f.updated_at || f.created_at || Date.now()).toLocaleDateString(),
          avatarBg: "#F3F4F6",
          avatarText: "#374151"
        };
      });
      setFacultyData(mapped);
      setStats({ total: mapped.length, approved: app, pending: pen, revision: rev });
    }
    load();
  }, []);

  // Derive filtered sorting
  const filteredData = useMemo(() => {
    let raw = facultyData.filter((f) => {
      // Name / Dept / Design Search
      const searchMatch =
        searchQuery === "" ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.desig.toLowerCase().includes(searchQuery.toLowerCase());

      const deptMatch =
        deptFilter === "All Departments" || f.dept === deptFilter;

      let statusMatch = true;
      if (statusFilter !== "All Statuses") {
        const normalizedFilter = statusFilter.toLowerCase();
        if (normalizedFilter.includes("pending")) {
          statusMatch = f.status === "pending_review" || f.status === "pending";
        } else if (normalizedFilter.includes("revision")) {
          statusMatch = f.status === "revision";
        } else {
          statusMatch = f.status === normalizedFilter;
        }
      }

      const designMatch =
        designFilter === "All Designations" || f.desig === designFilter;

      return searchMatch && deptMatch && statusMatch && designMatch;
    });

    // Sorting
    raw.sort((a, b) => {
      let valA: string | number = a[sortColumn];
      let valB: string | number = b[sortColumn];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });

    return raw;
  }, [searchQuery, deptFilter, statusFilter, designFilter, sortColumn, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((f) => f.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const exportCSV = (data: FacultyRow[]) => {
    const headers = [
      "ID",
      "Name",
      "Designation",
      "Department",
      "Status",
      "Completion (%)",
      "Views",
      "Last Updated",
    ];
    const rows = data.map((f) => [
      f.id,
      `"${f.name}"`,
      `"${f.desig}"`,
      `"${f.dept}"`,
      f.status,
      f.completion,
      f.views,
      f.updated,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fpmp_faculty_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    return sortColumn === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={14} className="ml-1 inline text-primary" />
      ) : (
        <ChevronDown size={14} className="ml-1 inline text-primary" />
      )
    ) : (
      <ChevronDown size={14} className="ml-1 inline opacity-30 group-hover:opacity-100" />
    );
  };

  const isAllSelected =
    paginatedData.length > 0 && selectedIds.size === paginatedData.length;

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 px-6 pt-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-headline text-[22px] font-bold tracking-tight text-slate-900">
            Faculty Management
          </h1>
          <p className="mt-1 font-body text-[14px] text-slate-500">
            Fr. Conceicao Rodrigues College of Engineering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(facultyData)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-headline text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            Export CSV
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 font-headline text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90">
            Invite Faculty
          </button>
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 border-l-[3px] border-l-primary bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Faculty
          </div>
          <div className="font-headline text-[28px] font-bold text-slate-900">
            {stats.total}
          </div>
          <div className="mt-1 font-body text-[12px] text-slate-500">
            Across 6 departments
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Approved
          </div>
          <div className="font-headline text-[28px] font-bold text-green-600">
            {stats.approved}
          </div>
          <div className="mt-1 font-body text-[12px] text-slate-500">
            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of total
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pending Review
          </div>
          <div className="font-headline text-[28px] font-bold text-amber-500">
            {stats.pending}
          </div>
          <div className="mt-1 font-body text-[12px] text-slate-500">
            Awaiting approval
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Needs Revision
          </div>
          <div className="font-headline text-[28px] font-bold text-red-600">
            {stats.revision}
          </div>
          <div className="mt-1 font-body text-[12px] text-slate-500">
            Sent back to faculty
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="mb-3 flex flex-col gap-2.5 px-6 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, department, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[38px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
        <select
          className="h-[38px] w-full max-w-[160px] rounded-lg border border-slate-300 bg-white px-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option>All Departments</option>
          <option>Electronics & CS</option>
          <option>Computer Engineering</option>
          <option>Electronics</option>
          <option>Mechanical</option>
          <option>Civil</option>
          <option>Information Tech</option>
        </select>
        <select
          className="h-[38px] w-full max-w-[140px] rounded-lg border border-slate-300 bg-white px-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Approved</option>
          <option>Pending Review</option>
          <option>Needs Revision</option>
          <option>Draft</option>
        </select>
        <select
          className="h-[38px] w-full max-w-[150px] rounded-lg border border-slate-300 bg-white px-3 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          value={designFilter}
          onChange={(e) => setDesignFilter(e.target.value)}
        >
          <option>All Designations</option>
          <option>Head of Department</option>
          <option>Professor</option>
          <option>Associate Professor</option>
          <option>Assistant Professor</option>
        </select>
      </div>

      <div className="mb-3 flex items-center justify-between px-6">
        <p className="font-body text-[12px] font-medium text-slate-400">
          Showing {filteredData.length} faculty members
        </p>
        <label className="flex cursor-pointer items-center gap-2 font-body text-[12px] text-slate-500 hover:text-slate-900 transition-colors">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
          />
          Select All
        </label>
      </div>

      {/* BULK ACTION BAR (Conditional) */}
      {selectedIds.size > 0 && (
        <div className="mx-6 mb-3 flex items-center gap-3 rounded-lg bg-slate-900 p-2.5 px-4 shadow-md">
          <span className="font-headline text-[13px] font-bold text-white">
            {selectedIds.size} faculty selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-md border border-white/30 px-3 py-1.5 font-headline text-[12px] font-semibold text-white transition-colors hover:bg-white/10">
              <MessageSquare size={14} /> Send Broadcast
            </button>
            <button
              onClick={() => {
                const selectedData = filteredData.filter((f) =>
                  selectedIds.has(f.id)
                );
                exportCSV(selectedData);
              }}
              className="flex items-center gap-1.5 rounded-md border border-white/30 px-3 py-1.5 font-headline text-[12px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Download size={14} /> Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-headline text-[12px] font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Clear Selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FACULTY TABLE CARD */}
      <div className="mx-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[40px] border-b-2 border-slate-200 px-[14px] py-[10px]">
                  {/* Empty header for checkboxes */}
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="group cursor-pointer border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Faculty <SortIcon col="name" />
                </th>
                <th
                  onClick={() => handleSort("dept")}
                  className="group cursor-pointer border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Department <SortIcon col="dept" />
                </th>
                <th
                  onClick={() => handleSort("desig")}
                  className="group cursor-pointer border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Designation <SortIcon col="desig" />
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="group cursor-pointer border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Status <SortIcon col="status" />
                </th>
                <th
                  onClick={() => handleSort("completion")}
                  className="group cursor-pointer border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Completion <SortIcon col="completion" />
                </th>
                <th
                  onClick={() => handleSort("views")}
                  className="group cursor-pointer border-b-2 border-slate-200 px-[14px] py-[10px] text-right font-label text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Views <SortIcon col="views" />
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Last Updated
                </th>
                <th className="border-b-2 border-slate-200 px-[14px] py-[10px] text-left font-label text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center font-body text-sm text-slate-500"
                  >
                    No faculty found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((f) => {
                  const isSelected = selectedIds.has(f.id);
                  return (
                    <tr
                      key={f.id}
                      className={`group border-b border-slate-200 transition-colors last:border-0 ${
                        isSelected
                          ? "border-l-2 border-l-primary bg-[#FFF9F7]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-[14px] py-[11px] align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(f.id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
                        />
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full font-headline text-[13px] font-bold shadow-sm"
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
                              {f.desig}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[14px] py-[11px] align-middle font-body text-[13px] text-slate-500">
                        {f.dept}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle font-body text-[13px] text-slate-500">
                        {f.desig}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-[6px] w-[64px] overflow-hidden rounded-[3px] bg-slate-100">
                            <div
                              className="h-full rounded-[3px] bg-primary"
                              style={{ width: `${f.completion}%` }}
                            />
                          </div>
                          <span className="font-headline text-[12px] font-medium text-slate-900">
                            {f.completion}%
                          </span>
                        </div>
                      </td>
                      <td className="px-[14px] py-[11px] text-right align-middle font-body text-[12px] text-slate-500">
                        {f.views}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle font-body text-[12px] text-slate-400">
                        {f.updated}
                      </td>
                      <td className="px-[14px] py-[11px] align-middle">
                        <div className="flex gap-1.5">
                          {f.status === "pending_review" || f.status === "revision" ? (
                            <Link
                              href={`/admin/approval/${f.id}`}
                              className="rounded-md border border-primary/20 bg-primary-container/40 px-3 py-1 font-headline text-[12px] font-semibold text-primary transition-colors hover:bg-primary-container"
                            >
                              Review
                            </Link>
                          ) : (
                            <Link href={`/admin/approval/${f.id}`} className="rounded-md border border-slate-300 px-3 py-1 font-headline text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                              View
                            </Link>
                          )}
                          <button className="flex items-center justify-center rounded-md border border-slate-300 px-1.5 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
                            <MoreHorizontal size={16} />
                          </button>
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
          {filteredData.length === 0
            ? 0
            : (currentPage - 1) * rowsPerPage + 1}
          –
          {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
          {filteredData.length} faculty
        </p>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-[28px] w-[28px] items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
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
