"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  RotateCcw,
  X as CloseIcon,
  Check,
  User,
  BookOpen,
  Tag,
  Trophy,
  GraduationCap,
  Award,
} from "lucide-react";

export default function ProfileApprovalPage() {
  const router = useRouter();
  const params = useParams();

  const [adminNotes, setAdminNotes] = useState("");
  const [notesError, setNotesError] = useState(false);

  const handleApprove = () => {
    alert("Profile approved and published.");
    router.push("/admin/faculty");
  };

  const handleRevise = () => {
    if (adminNotes.trim() === "") {
      setNotesError(true);
      return;
    }
    setNotesError(false);
    alert("Revision requested. Faculty has been notified.");
    router.push("/admin/faculty");
  };

  const handleReject = () => {
    if (window.confirm("Are you sure you want to reject this profile?")) {
      alert("Profile rejected.");
      router.push("/admin/faculty");
    }
  };

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="flex flex-col items-start gap-4 px-6 pb-4 pt-6 md:flex-row md:items-center">
        <button
          onClick={() => router.push("/admin/faculty")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-headline text-[12px] font-semibold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          ← Back to Faculty
        </button>

        <div className="flex-1">
          <h1 className="font-headline text-[20px] font-bold text-slate-900">
            Profile Review — Dr. Swapnali Makdey
          </h1>
          <p className="font-body text-[13px] text-slate-500">
            Submitted 2 hours ago · Electronics & CS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          <button
            onClick={handleRevise}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 font-headline text-[13px] font-medium text-amber-900 shadow-sm transition-colors hover:bg-amber-200"
          >
            <RotateCcw size={14} /> Request Revision
          </button>
          <button
            onClick={handleReject}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-100 px-4 py-2 font-headline text-[13px] font-medium text-red-700 shadow-sm transition-colors hover:bg-red-200"
          >
            <CloseIcon size={14} /> Reject
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 font-headline text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Check size={14} /> Approve & Publish
          </button>
        </div>
      </div>

      {/* REVIEWER NOTES BOX */}
      <div className="mx-6 mb-4 flex flex-col items-start gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row">
        <div className="flex-1 w-full">
          <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Admin Notes (sent to faculty if revision requested)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => {
              setAdminNotes(e.target.value);
              setNotesError(false);
            }}
            rows={3}
            placeholder="Add internal notes or feedback for the faculty member..."
            className={`w-full rounded-lg border bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:ring-[3px] focus:ring-primary/10 ${
              notesError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-300 focus:border-primary"
            }`}
          />
          {notesError && (
            <p className="mt-1 font-body text-[11px] text-red-500">
              Please add notes before requesting revision.
            </p>
          )}
        </div>

        <div className="w-full min-w-[200px] md:w-auto">
          <div className="mb-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Submission Info
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Submitted by</span>
              <span className="font-semibold text-slate-900">
                Dr. S. Makdey
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Submitted on</span>
              <span className="font-semibold text-slate-900">
                April 3, 2026
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Profile version</span>
              <span className="font-semibold text-slate-900">v4</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1 font-body text-[12px]">
              <span className="text-slate-500">Previous status</span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-green-800">
                Approved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DIFF VIEW COLUMN LABELS */}
      <div className="mx-6 mb-2 flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
          <span className="font-headline text-[12px] font-bold text-red-700">
            Previous Version
          </span>
          <span className="ml-auto font-body text-[11px] text-slate-500">
            Last approved · March 15, 2026
          </span>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-green-600" />
          <span className="font-headline text-[12px] font-bold text-green-700">
            Submitted Version
          </span>
          <span className="ml-auto font-body text-[11px] text-slate-500">
            Pending review · April 3, 2026
          </span>
        </div>
      </div>

      {/* DIFF SECTIONS */}
      <div className="mx-6 mb-6 flex flex-col gap-4">
        {/* SECTION 1: ABOUT */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <User size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              About
            </span>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold text-amber-800">
              Modified
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-red-50/50 p-4 md:border-b-0 md:border-r">
              <p className="font-body text-[13px] leading-relaxed text-slate-700">
                Dr. Swapnali Ashish Makdey is the Head of the Department of
                Electronics and Computer Science at Fr. Conceicao Rodrigues
                College of Engineering. She holds a PhD from VNIT Nagpur and
                brings{" "}
                <span className="rounded px-1 bg-red-100 text-red-800 line-through">
                  22 years
                </span>{" "}
                of expertise in VLSI design.
              </p>
            </div>
            <div className="flex-1 bg-green-50/50 p-4">
              <p className="font-body text-[13px] leading-relaxed text-slate-700">
                Dr. Swapnali Ashish Makdey is the Head of the Department of
                Electronics and Computer Science at Fr. Conceicao Rodrigues
                College of Engineering. She holds a PhD from VNIT Nagpur and
                brings{" "}
                <span className="rounded bg-green-200/60 px-1 font-medium text-green-900">
                  25 years
                </span>{" "}
                of expertise in VLSI design,{" "}
                <span className="rounded bg-green-200/60 px-1 font-medium text-green-900">
                  embedded systems, and machine learning applications in
                  semiconductor technology. She serves as AP/ED Chair of the
                  IEEE Bombay Section
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: PUBLICATIONS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <BookOpen size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Publications
            </span>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold text-amber-800">
              Modified
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-red-50/50 p-4 md:border-b-0 md:border-r">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  1. Novel Applications of Deep Learning in Remote Sensing
                  Satellite Imagery — JISEM 2025
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  2. Modeling and Implementation of Spin Diode Based on 2D
                  Materials — Circuit World 2020
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  3. Design of Behavior Prediction Model of MoS2 —
                  Semiconductor Sci. & Tech. 2023
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-green-50/50 p-4">
              <div className="mb-2 inline-block rounded-full bg-green-100 px-2 py-0.5 font-label text-[11px] font-bold text-green-800">
                1 new publication added
              </div>
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  1. Novel Applications of Deep Learning in Remote Sensing
                  Satellite Imagery — JISEM 2025
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  2. Modeling and Implementation of Spin Diode Based on 2D
                  Materials — Circuit World 2020
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  3. Design of Behavior Prediction Model of MoS2 —
                  Semiconductor Sci. & Tech. 2023
                </li>
                <li className="rounded border-b border-slate-200/50 bg-green-200/50 px-1 pb-2 pt-1 font-body text-[12px] font-medium text-green-900">
                  4. A Novel Neural-Based Design of Graphene and MoS2 Magnetic
                  Tunnel Junction — JISEM 2025 (Scopus)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 3: RESEARCH KEYWORDS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Tag size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Research Keywords
            </span>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold text-amber-800">
              Modified
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-red-50/50 p-4 md:border-b-0 md:border-r">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "VLSI Design",
                  "Analog VLSI",
                  "Machine Learning",
                  "Verilog",
                  "EDA Tools",
                ].map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-slate-200 px-2.5 py-1 font-label text-[11px] font-semibold text-slate-600"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-green-50/50 p-4">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "VLSI Design",
                  "Analog VLSI",
                  "Machine Learning",
                  "Verilog",
                  "EDA Tools",
                ].map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-slate-200 px-2.5 py-1 font-label text-[11px] font-semibold text-slate-600"
                  >
                    {kw}
                  </span>
                ))}
                {["SystemVerilog", "Deep Learning", "RTL to GDSII", "2D Materials"].map(
                  (kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-green-200 px-2.5 py-1 font-label text-[11px] font-bold text-green-900"
                    >
                      {kw}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: AWARDS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Trophy size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Awards
            </span>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold text-amber-800">
              Modified
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-red-50/50 p-4 md:border-b-0 md:border-r">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  1. Best IEEE Branch Counselor — IEEE Bombay Section, 2012
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  2. Best Paper in Track — Sinhagad Institute, 2024
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-green-50/50 p-4">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  1. Best IEEE Branch Counselor — IEEE Bombay Section, 2012
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  2. Best Paper in Track — Sinhagad Institute, 2024
                </li>
                <li className="rounded bg-green-200/50 px-1 py-1 font-body text-[12px] font-medium text-green-900">
                  3. Most Influential Professor Award — Hotel Taj Lands End,
                  Mumbai, 2025
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 5: EDUCATION */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <GraduationCap size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Education
            </span>
            <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 font-label text-[10px] font-semibold text-slate-500">
              No Change
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-slate-200 bg-slate-50/50 p-4 md:border-b-0 md:border-r">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  • PhD - VLSI & Nanotechnology — VNIT Nagpur (2018)
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  • M.E. Electronics Engineering — Fr. CRCE, Mumbai (2004)
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  • B.E. Electronics Engineering — Shivaji University, Kolhapur
                  (2001)
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-slate-50/50 p-4">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  • PhD - VLSI & Nanotechnology — VNIT Nagpur (2018)
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  • M.E. Electronics Engineering — Fr. CRCE, Mumbai (2004)
                </li>
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  • B.E. Electronics Engineering — Shivaji University, Kolhapur
                  (2001)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 6: CERTIFICATIONS */}
        <div>
          <div className="flex items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-100 px-3.5 py-2">
            <Award size={14} className="text-slate-500" />
            <span className="font-label text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Certifications
            </span>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold text-amber-800">
              Modified
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 md:flex-row">
            <div className="flex-1 border-b border-red-300 bg-red-50/50 p-4 md:border-b-0 md:border-r">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  1. VLSI Digital IC Design Lab Primer — Entuple Technologies,
                  2021
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-green-50/50 p-4">
              <ul className="flex flex-col gap-2">
                <li className="border-b border-slate-200/50 pb-2 font-body text-[12px] text-slate-600">
                  1. VLSI Digital IC Design Lab Primer — Entuple Technologies,
                  2021
                </li>
                <li className="rounded bg-green-200/50 px-1 py-1 font-body text-[12px] font-medium text-green-900">
                  2. Python with Machine Learning — Labview Academy, 2024
                </li>
                <li className="rounded bg-green-200/50 px-1 py-1 font-body text-[12px] font-medium text-green-900">
                  3. ATAL FDP - Semiconductor Digital System Design — Fr. CRCE,
                  2023
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="mx-6 mb-10 flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5 md:flex-row md:items-center md:gap-6 shadow-sm">
        <span className="font-headline text-[13px] font-bold uppercase tracking-wider text-slate-600 shrink-0">
          Change Summary
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 font-label text-[11px] font-bold tracking-wide text-amber-800">
            5 sections modified
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 font-label text-[11px] font-bold tracking-wide text-green-800">
            1 publication added
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 font-label text-[11px] font-bold tracking-wide text-green-800">
            4 keywords added
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 font-label text-[11px] font-bold tracking-wide text-green-800">
            2 certifications added
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 font-label text-[11px] font-bold tracking-wide text-green-800">
            1 award added
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
