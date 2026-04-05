"use client";

import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { CheckSquare } from "lucide-react";

const pendingApprovals = [
  {
    id: "1",
    name: "Dr. Swapnali Makdey",
    dept: "Electronics & CS",
    status: "pending",
    submitted: "2 hours ago",
    type: "Profile Update",
  },
  {
    id: "3",
    name: "Dr. Anita Patil",
    dept: "Electronics & CS",
    status: "revision",
    submitted: "5 days ago",
    type: "New Publication",
  },
];

export default function ApprovalsPage() {
  return (
    <AdminLayout>
      <div className="px-6 pt-6 mb-6">
        <h1 className="flex items-center gap-2 font-headline text-[22px] font-bold tracking-tight text-slate-900">
          <CheckSquare size={24} className="text-primary" />
          Pending Approvals
        </h1>
        <p className="mt-1 font-body text-[14px] text-slate-500">
          Items requiring administrator review and moderation.
        </p>
      </div>

      <div className="px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Faculty
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Department
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Request Type
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Submitted
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wide text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-headline font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {req.name}
                    </td>
                    <td className="px-4 py-3 font-body text-slate-500">
                      {req.dept}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-label text-[10px] font-bold text-blue-700 tracking-wider">
                        {req.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-slate-500">
                      {req.submitted}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/approval/${req.id}`}
                        className="rounded-lg bg-primary px-4 py-1.5 font-headline text-[12px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 inline-block"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pendingApprovals.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm font-body">
                No pending approvals at this time.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
