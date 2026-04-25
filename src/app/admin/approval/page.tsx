"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { CheckSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ApprovalRow {
  id: string;
  name: string;
  dept: string;
  status: string;
  submitted: string;
  type: string;
}

export default function ApprovalsPage() {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('faculty_profiles')
        .select('id, name, department, profile_status, updated_at, created_at')
        .in('profile_status', ['pending_review', 'revision', 'pending']);
      
      if (data) {
        setPendingApprovals(data.map(f => ({
          id: f.id,
          name: f.name || "Unknown",
          dept: f.department || "Unknown",
          status: f.profile_status || "pending",
          submitted: new Date(f.updated_at || f.created_at || Date.now()).toLocaleDateString(),
          type: "Profile Update"
        })));
      }
      setLoading(false);
    }
    load();
  }, []);
  return (
    <AdminLayout>
      <div className="px-6 pt-6 mb-6">
        <h1 className="flex items-center gap-2 font-headline text-[22px] font-bold tracking-tight text-slate-900">
          <CheckSquare size={24} className="text-primary" />
          Pending Reviews
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
                      <span className={`rounded-full px-2.5 py-1 font-label text-[10px] font-bold tracking-wider ${req.status === 'revision' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
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
            
            {loading && (
              <div className="py-12 text-center text-slate-500 text-sm font-body">
                Loading reviews...
              </div>
            )}
            
            {!loading && pendingApprovals.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm font-body">
                No pending reviews at this time.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
