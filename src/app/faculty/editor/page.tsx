"use client";

import { useState } from "react";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import { Save, Send, Plus, Trash2, CheckCircle2, ChevronRight } from "lucide-react";

type Tab = "Basic Info" | "About" | "Education" | "Publications" | "Keywords";

export default function FacultyEditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Basic Info");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (submit: boolean = false) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (submit) {
        alert("Profile submitted for review successfully.");
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 800);
  };

  const tabs: Tab[] = ["Basic Info", "About", "Education", "Publications", "Keywords"];

  return (
    <FacultyLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* PAGE HEADER */}
        <div className="px-6 py-6 border-b border-outline-variant/30 shrink-0 bg-surface">
          <h1 className="font-headline text-[22px] font-bold tracking-tight text-primary">
            Profile Editor
          </h1>
          <p className="mt-1 font-body text-[14px] text-secondary">
            Keep your academic and professional data up to date.
          </p>
        </div>

        {/* EDITOR LAYOUT */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* SIDEBAR TABS */}
          <div className="w-full md:w-[220px] shrink-0 border-r border-outline-variant/30 flex flex-row md:flex-col overflow-x-auto bg-surface-container-lowest">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-between px-5 py-4 font-headline text-[13px] transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary-container/30 text-primary font-bold border-r-[3px] border-r-primary"
                    : "text-secondary font-medium hover:bg-surface-container hover:text-primary"
                }`}
              >
                {tab}
                <ChevronRight size={14} className={`hidden md:block transition-opacity ${activeTab === tab ? "opacity-100" : "opacity-0"}`} />
              </button>
            ))}
          </div>

          {/* MAIN FORM AREA */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
            <div className="max-w-[700px]">
              
              {activeTab === "Basic Info" && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Full Name</label>
                      <input type="text" defaultValue="Dr. Swapnali Ashish Makdey" className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Designation</label>
                      <input type="text" defaultValue="Head of Department" className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Department</label>
                      <select className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all">
                        <option>Electronics & CS</option>
                        <option>Mechanical</option>
                        <option>Civil</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Email Address</label>
                      <input type="email" defaultValue="swapnali@frcrce.ac.in" className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "About" && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">About / Overview</h2>
                  <div>
                    <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Professional Biography</label>
                    <textarea 
                      rows={8}
                      defaultValue="Dr. Swapnali Ashish Makdey is the Head of the Department of Electronics and Computer Science at Fr. Conceicao Rodrigues College of Engineering..."
                      className="w-full resize-y border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all leading-relaxed" 
                    />
                  </div>
                </div>
              )}

              {activeTab === "Publications" && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Publications</h2>
                  
                  <div className="flex flex-col gap-4">
                    {/* Item 1 */}
                    <div className="border border-outline-variant rounded-lg bg-surface p-4 relative group">
                      <button className="absolute top-4 right-4 text-outline hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Title</label>
                      <input type="text" defaultValue="Novel Applications of Deep Learning in Remote Sensing Satellite Imagery" className="w-full mb-3 border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Journal / Conference</label>
                          <input type="text" defaultValue="JISEM 2025" className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
                        </div>
                        <div>
                          <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Year</label>
                          <input type="text" defaultValue="2025" className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
                        </div>
                      </div>
                    </div>

                    <button className="flex items-center justify-center gap-2 border border-dashed border-primary text-primary bg-primary-container/20 rounded-lg py-3 font-headline text-[13px] font-bold hover:bg-primary-container/40 transition-colors">
                      <Plus size={16} /> Add Publication
                    </button>
                  </div>
                </div>
              )}

              {/* Placedholders for other tabs for brevity */}
              {(activeTab === "Education" || activeTab === "Keywords") && (
                <div className="py-12 text-center text-secondary font-body">
                  Form configuration for {activeTab} mapped dynamically.
                </div>
              )}

            </div>
          </div>
        </div>

        {/* STICKY FOOTER TOOLBAR */}
        <div className="shrink-0 border-t border-outline-variant/30 bg-surface px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showSuccess && (
              <span className="flex items-center gap-1 font-headline text-[13px] font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle2 size={16} /> Draft Saved Automatically
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-surface-container font-headline text-[13px] font-medium text-secondary hover:text-primary transition-colors hover:bg-surface-container-high active:scale-95 disabled:opacity-50"
            >
              <Save size={16} /> Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary font-headline text-[13px] font-bold text-on-primary transition-opacity hover:opacity-90 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Send size={16} /> {isSaving ? "Processing..." : "Submit for Approval"}
            </button>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
