"use client";

import React, { useState } from "react";
import { Rocket, Lightbulb, Briefcase, Zap, X, Globe, Calendar, User } from "lucide-react";
import SectionHeader from "./SectionHeader"; // Wait, SectionHeader is in page.tsx. I should move it or re-create it.

const SectionHeaderLocal = ({ title, count }: { title: string; count?: number }) => (
  <div className="mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-2">
    <h3 className="font-label text-[11px] font-bold uppercase tracking-widest text-outline">
      {title}
    </h3>
    {count !== undefined && (
      <span className="rounded-full bg-primary px-2 py-0.5 font-label text-[10px] font-bold text-on-primary">
        {count} items
      </span>
    )}
  </div>
);

interface Project {
  title: string;
  description: string;
  role: string;
  year: string;
  url?: string;
}

export default function StrategicProjects({ projects }: { projects: Project[] }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <section className="mb-16">
      <SectionHeaderLocal title="Strategic Initiatives & Projects" count={projects.length} />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj, idx) => (
          <div 
            key={idx} 
            onClick={() => setActiveProject(proj)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-outline-variant/20 bg-white p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 active:scale-[0.98]"
          >
            {/* Decorative Background Element */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-150 group-hover:-translate-x-6 group-hover:translate-y-6" />
            
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-[10deg] shadow-sm">
                  {idx % 3 === 0 ? <Rocket size={26} /> : idx % 3 === 1 ? <Lightbulb size={26} /> : <Briefcase size={26} />}
                </div>
                <span className="rounded-full bg-surface-container-high px-4 py-1.5 font-label text-[11px] font-bold tracking-widest text-primary uppercase border border-outline-variant/10">
                  {proj.year || "Active"}
                </span>
              </div>

              <h4 className="mb-3 font-headline text-[19px] font-black text-primary leading-tight transition-colors group-hover:text-blue-800">
                {proj.title}
              </h4>
              
              <p className="mb-8 font-body text-[14px] leading-relaxed text-secondary opacity-80 line-clamp-4 flex-1">
                {proj.description || "Leading strategic research and innovation in this domain to drive academic excellence and industrial impact."}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-6">
                {proj.role && String(proj.role).trim() !== "" ? (
                  <div className="inline-flex items-center gap-2.5 rounded-full bg-primary/5 px-4 py-2 font-label text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                    <Zap size={14} className="fill-primary/20" />
                    {proj.role}
                  </div>
                ) : (
                  <div className="h-6" />
                )}
                
                <div className="flex items-center gap-1.5 font-label text-[11px] font-bold uppercase tracking-widest text-primary opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                  Explore <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED PROJECT MODAL */}
      {activeProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-primary/20 backdrop-blur-md transition-opacity" 
            onClick={() => setActiveProject(null)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-outline-variant/30 bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header/Hero */}
            <div className="relative h-32 bg-gradient-to-br from-primary to-blue-800 p-8">
              <button 
                onClick={() => setActiveProject(null)}
                className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X size={20} />
              </button>
              <div className="mt-4 flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2 text-white backdrop-blur-sm">
                  <Rocket size={24} />
                </div>
                <span className="font-label text-[12px] font-bold uppercase tracking-[0.2em] text-white/80">Project Details</span>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <h2 className="mb-6 font-headline text-2xl font-black text-primary leading-tight">
                {activeProject.title}
              </h2>

              <div className="mb-8 grid grid-cols-2 gap-6 border-y border-outline-variant/10 py-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-outline">
                    <Calendar size={14} />
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest">Status / Year</span>
                  </div>
                  <p className="font-headline text-[15px] font-bold text-secondary">
                    {activeProject.year ? `FY ${activeProject.year}` : "Active Initiative"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-outline">
                    <User size={14} />
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest">Leadership Role</span>
                  </div>
                  <p className="font-headline text-[15px] font-bold text-secondary">{activeProject.role || "Project Lead"}</p>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-label text-[11px] font-bold uppercase tracking-widest text-primary">Objective & Impact</h4>
                 <p className="font-body text-[15px] leading-relaxed text-secondary opacity-90 italic">
                   {activeProject.description || "This project focuses on strategic research and implementation within the faculty's domain, aiming to deliver significant academic contributions and institutional growth. Detailed impact metrics and specific project outcomes are available upon request."}
                 </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                {activeProject.url && (
                  <a 
                    href={activeProject.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-headline text-[14px] font-bold text-white shadow-lg transition-all hover:bg-blue-800 hover:shadow-primary/20"
                  >
                    <Globe size={18} />
                    View Live Project
                  </a>
                )}
                <button 
                  onClick={() => setActiveProject(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface py-4 font-headline text-[14px] font-bold text-secondary transition-all hover:bg-surface-container-low"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
