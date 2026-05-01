"use client";

import React, { useState } from "react";
import { BookOpen, Globe, X, Calendar, Bookmark, Hash, ExternalLink } from "lucide-react";

const SectionHeaderLocal = ({ title, count }: { title: string; count?: number }) => (
  <div className="mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-2">
    <h3 className="font-headline text-[15px] font-extrabold uppercase tracking-widest text-primary">
      {title}
    </h3>
    {count !== undefined && (
      <span className="rounded-full bg-primary px-2 py-0.5 font-label text-[10px] font-bold text-on-primary">
        {count} items
      </span>
    )}
  </div>
);

interface Publication {
  title: string;
  journal?: string;
  venue?: string;
  year: string;
  doi?: string;
  index_tag?: string;
  award?: string;
}

export default function ResearchPublications({ publications }: { publications: Publication[] }) {
  const [activePub, setActivePub] = useState<Publication | null>(null);

  return (
    <section className="mb-16">
      <SectionHeaderLocal title="Scholarly Research & Publications" count={publications.length} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {publications.map((paper, idx) => (
          <div 
            key={idx} 
            onClick={() => setActivePub(paper)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-outline-variant/20 bg-white p-7 transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99]"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
            
            <div className="relative z-10">
              <div className="mb-3 flex flex-wrap gap-2">
                {paper.index_tag && (
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-label text-[9px] font-bold text-blue-700 uppercase tracking-widest border border-blue-100 shadow-sm">
                    {paper.index_tag}
                  </span>
                )}
                {paper.award && (
                  <span className="rounded bg-amber-50 px-2 py-0.5 font-label text-[9px] font-bold text-amber-700 uppercase tracking-widest border border-amber-100 shadow-sm">
                    {paper.award}
                  </span>
                )}
                <span className="ml-auto font-label text-[10px] font-bold text-outline">#{idx + 1}</span>
              </div>

              <h4 className="mb-4 font-headline text-[16px] font-bold text-primary leading-snug transition-colors group-hover:text-blue-800">
                {paper.title}
              </h4>
              
              <div className="flex flex-col gap-3 border-t border-outline-variant/10 pt-4">
                <div className="flex items-start gap-2.5 font-body text-[13px] text-secondary">
                  <BookOpen size={16} className="mt-0.5 shrink-0 text-primary/60" />
                  <span className="leading-tight">
                    <span className="font-semibold text-primary/80">{paper.journal || paper.venue}</span>
                    {paper.year && <span className="ml-2 text-outline font-medium">({paper.year})</span>}
                  </span>
                </div>

                {paper.doi && (
                  <div className="flex items-center gap-2.5 font-body text-[11px] text-outline italic">
                    <Globe size={14} className="shrink-0" />
                    <span className="truncate">DOI: {paper.doi}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED PUBLICATION MODAL */}
      {activePub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-primary/20 backdrop-blur-md transition-opacity" 
            onClick={() => setActivePub(null)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-outline-variant/30 bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="relative h-32 bg-gradient-to-br from-blue-700 to-indigo-900 p-8">
              <button 
                onClick={() => setActivePub(null)}
                className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X size={20} />
              </button>
              <div className="mt-4 flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2 text-white backdrop-blur-sm">
                  <Bookmark size={24} />
                </div>
                <span className="font-label text-[12px] font-bold uppercase tracking-[0.2em] text-white/80">Research Paper</span>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <h2 className="mb-6 font-headline text-2xl font-black text-primary leading-tight">
                {activePub.title}
              </h2>

              <div className="mb-8 grid grid-cols-2 gap-6 border-y border-outline-variant/10 py-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-outline">
                    <Calendar size={14} />
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest">Year</span>
                  </div>
                  <p className="font-headline text-[15px] font-bold text-secondary">{activePub.year}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-outline">
                    <Hash size={14} />
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest">Indexing</span>
                  </div>
                  <p className="font-headline text-[15px] font-bold text-secondary">{activePub.index_tag || "General"}</p>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-label text-[11px] font-bold uppercase tracking-widest text-primary">Published In</h4>
                 <div className="flex items-start gap-4 rounded-2xl bg-surface-container-low p-6 border border-outline-variant/10">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                       <BookOpen size={24} />
                    </div>
                    <div>
                       <p className="font-headline text-[16px] font-bold text-primary">{activePub.journal || activePub.venue}</p>
                       {activePub.award && (
                         <p className="mt-1 font-label text-[11px] font-bold uppercase tracking-wide text-amber-600">{activePub.award}</p>
                       )}
                    </div>
                 </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                {activePub.doi ? (
                  <a 
                    href={`https://doi.org/${activePub.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-headline text-[14px] font-bold text-white shadow-lg transition-all hover:bg-blue-800"
                  >
                    <ExternalLink size={18} />
                    Read Full Paper
                  </a>
                ) : (
                  <button 
                    disabled
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-surface-container-high py-4 font-headline text-[14px] font-bold text-outline opacity-50"
                  >
                    No Link Available
                  </button>
                )}
                <button 
                  onClick={() => setActivePub(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface py-4 font-headline text-[14px] font-bold text-secondary transition-all hover:bg-surface-container-low"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
