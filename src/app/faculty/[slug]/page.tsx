"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Image as ImageIcon } from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";

const facultyProfile = {
  name: "Dr. Swapnali Ashish Makdey",
  initials: "SM",
  designation: "Head of Department",
  department: "Electronics & Computer Science",
  experience: "25 years",
  email: "swapnali@frcrce.ac.in",
  phone: "+91 9769091874",
  memberships: ["IEEE", "ISTE", "VLSI Society of India", "FSAI"],
  status: "approved",
  about:
    "Dr. Swapnali Ashish Makdey is the Head of the Department of Electronics and Computer Science at Fr. Conceicao Rodrigues College of Engineering, Mumbai. She holds a PhD in VLSI from the Centre of VLSI and Nanotechnology at VNIT Nagpur and brings 25 years of expertise in VLSI design, embedded systems, and machine learning applications in semiconductor technology. She currently serves as the AP/ED Chair of the IEEE Bombay Section and has been recognised as the Most Influential Professor at a ceremony held at Hotel Taj Lands End, Mumbai in 2025.",
  keywords: [
    "VLSI Design",
    "Analog VLSI",
    "Machine Learning",
    "Verilog",
    "SystemVerilog",
    "EDA Tools",
    "Deep Learning",
    "RTL to GDSII",
    "2D Materials",
  ],
  journalPapers: [
    {
      title: "Novel Applications of Deep Learning in Remote Sensing Satellite Imagery",
      journal: "JISEM, Vol.10 No.26s (2025)",
      index: "Scopus",
      doi: "10.52783/jisem.v10i26s",
    },
    {
      title: "A Novel Neural-Based Design of Graphene and MoS2 Magnetic Tunnel Junction",
      journal: "JISEM 2025, Vol.10 No.11s",
      index: "Scopus",
      doi: "10.52783/jisem.v10i11s.1668",
    },
    {
      title: "Modeling and Implementation of Spin Diode Based on 2D Materials",
      journal: "Circuit World, Vol.47 No.4 (2020)",
      index: "SCI",
      doi: "",
    },
    {
      title: "Design of Behavior Prediction Model of MoS2 Magnetic Tunnel Junctions",
      journal: "Semiconductor Science and Technology (2023)",
      index: "SCI",
      doi: "",
    },
  ],
  invitedTalks: [
    {
      topic: "Machine Learning in VLSI Design",
      event: "FDP, K J Somaiya School of Engineering",
      date: "December 2025",
      mode: "offline",
    },
    {
      topic: "AI Tools for Research",
      event: "Online FDP, Ashokrao Mane Polytechnic",
      date: "August 2025",
      mode: "online",
    },
  ],
};

// --- NEW BACKEND-READY ANALYTICS STATE ARRAYS ---
const statsData = {
  distribution: [
    { label: "Journals", percentage: 55, color: "#E8580A", actualCount: 15 },
    { label: "Conferences", percentage: 30, color: "#2563EB", actualCount: 8 },
    { label: "Invited Talks", percentage: 15, color: "#16A34A", actualCount: 4 },
  ],
  outputByYear: [
    { year: "2021", count: 2 },
    { year: "2022", count: 3 },
    { year: "2023", count: 5 },
    { year: "2024", count: 4 },
    { year: "2025", count: 9 },
    { year: "2026", count: 1 },
  ]
};

const timelineData = [
  { year: "2025", title: "Most Influential Professor Award", type: "award", subtitle: "Hotel Taj Lands End, Mumbai" },
  { year: "2024", title: "Best Paper in Track - AI/ML/DL Track", type: "award", subtitle: "Sinhagad Institute, Pune" },
  { year: "2018", title: "PhD - VLSI & Nanotechnology", type: "education", subtitle: "VNIT Nagpur" },
  { year: "2012", title: "Best IEEE Branch Counselor", type: "award", subtitle: "IEEE Bombay Section" },
  { year: "2004", title: "M.E. Electronics Engineering", type: "education", subtitle: "Fr. CRCE, Mumbai" },
  { year: "2001", title: "B.E. Electronics Engineering", type: "education", subtitle: "Shivaji University, Kolhapur" },
];

const SectionHeader = ({ title, count }: { title: string; count?: number }) => (
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

function ExpandableList<T>({
  items,
  renderItem,
  limit = 3,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <>
      <div className="flex flex-col">{visibleItems.map(renderItem)}</div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full py-2 text-center font-headline text-[13px] font-bold text-primary transition-all hover:text-blue-600 hover:underline"
        >
          {expanded ? "Show less" : `View all ${items.length}`}
        </button>
      )}
    </>
  );
}

export default function FacultyProfile() {
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! We will get back to you.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      {/* NAVBAR */}
      <PublicNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-12 pt-24 md:px-12">
        {/* BACK BUTTON */}
        <div className="py-6">
          <button onClick={() => router.push("/directory")} className="group inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary">
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            Back to Directory
          </button>
        </div>

        {/* PROFILE HERO BANNER */}
        <div className="mb-10 flex flex-col gap-8 overflow-hidden rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-surface-container-high to-surface-container-highest p-8 shadow-sm md:flex-row md:items-start">
          <div className="relative flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-2xl bg-surface shadow-md border-4 border-surface overflow-hidden group">
            {/* PHOTO PLACEHOLDER */}
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
              <ImageIcon className="text-slate-300 w-12 h-12" />
            </div>
            {/* If actual image exists, it would go here */}
            {/* <Image 
               src="/path/to/photo.jpg" 
               alt={facultyProfile.name} 
               fill 
               className="object-cover"
            /> */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">Update Photo</span>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="mb-1 font-headline text-[32px] font-extrabold tracking-tighter text-primary">
              {facultyProfile.name}
            </h1>
            <p className="mb-4 font-body text-[15px] font-medium text-secondary">
              {facultyProfile.designation} — {facultyProfile.experience} experience
            </p>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary px-3 py-1 font-label text-[11px] font-bold uppercase tracking-wider text-on-primary">
                {facultyProfile.department}
              </span>
            </div>

            <div className="flex flex-col gap-3 font-body text-[13px] font-medium text-secondary md:flex-row md:items-center md:gap-6">
              <div className="flex items-center gap-1.5 transition-colors hover:text-primary">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {facultyProfile.email}
              </div>
              <div className="flex items-center gap-1.5 transition-colors hover:text-primary">
                <span className="material-symbols-outlined text-[16px]">call</span>
                {facultyProfile.phone}
              </div>
              <div className="flex items-center gap-1.5 transition-colors hover:text-primary">
                <span className="material-symbols-outlined text-[16px]">group</span>
                {facultyProfile.memberships.join(" · ")}
              </div>
            </div>
          </div>

          <div className="mt-4 flex shrink-0 flex-col items-center md:mt-0">
            <div className="flex h-[80px] w-[80px] items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-sm">
              <div
                className="h-full w-full opacity-30"
                style={{
                  background: "repeating-conic-gradient(currentColor 0% 25%, transparent 0% 50%)",
                  backgroundSize: "6px 6px",
                  color: "#9A9AAA",
                }}
              />
            </div>
            <p className="mt-2 text-center font-label text-[10px] uppercase tracking-wide text-outline">
              Download Card
            </p>
          </div>
        </div>

        {/* PROFILE OVERVIEW & KEYWORDS */}
        <div className="mb-10 flex flex-col gap-6">
          <section>
            <SectionHeader title="Overview" />
            <p className="font-body text-[14px] leading-relaxed text-secondary border-l-[3px] border-primary/40 pl-5 py-1">
              {facultyProfile.about}
            </p>
          </section>

          <section>
            <SectionHeader title="Research Keywords" />
            <div className="flex flex-wrap gap-2">
              {facultyProfile.keywords.map((kw) => (
                <span
                  key={kw}
                  className="cursor-default rounded-md border border-outline-variant/20 bg-surface-container-low px-3 py-1.5 font-label text-[10px] font-bold uppercase tracking-wider text-secondary transition-colors hover:border-primary/30 hover:bg-surface-container hover:text-primary"
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* ACADEMIC IMPACT & OUTPUT (PREMIUM CHARTS BLOCK) */}
        <div className="grid grid-cols-1 gap-6 mb-12 lg:grid-cols-3">
          
          {/* Research Footprint Donut */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm flex flex-col items-center">
            <h3 className="font-headline text-[15px] font-bold text-primary w-full mb-6">Research Footprint</h3>
            
            <div className="relative h-[160px] w-[160px] rounded-full overflow-hidden mb-6" style={{
              background: `conic-gradient(
                #E8580A 0% 55%, 
                #2563EB 55% 85%, 
                #16A34A 85% 100%
              )`
            }}>
              <div className="absolute inset-0 m-auto h-[110px] w-[110px] rounded-full bg-surface-container-lowest flex flex-col items-center justify-center shadow-inner">
                <span className="font-headline text-[28px] font-bold text-primary leading-none">27</span>
                <span className="font-label text-[9px] uppercase font-bold text-outline mt-1 tracking-widest">Items</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              {statsData.distribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between font-body text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="h-[10px] w-[10px] rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-secondary font-medium">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-outline">{d.actualCount}</span>
                    <span className="font-bold text-primary w-8 text-right">{d.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Output */}
          <div className="lg:col-span-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm flex flex-col">
            <h3 className="font-headline text-[15px] font-bold text-primary mb-6">Publication Output</h3>
            
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 h-[180px] w-full border-b border-outline-variant/30 pb-3">
              {statsData.outputByYear.map((d, i) => {
                const max = Math.max(...statsData.outputByYear.map(x => x.count));
                const heightPct = (d.count / max) * 100;
                // Add a minimum height so empty years still show a tiny sliver
                const finalHeight = Math.max(heightPct, 5); 
                
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full gap-2 group flex-1">
                    <span className="font-headline text-[13px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">{d.count}</span>
                    <div 
                      className="w-full max-w-[48px] bg-primary-container disabled-lighten rounded-t-lg group-hover:bg-primary transition-all duration-300 relative overflow-hidden" 
                      style={{ height: `${finalHeight}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
                    </div>
                    <span className="font-label text-[10px] font-bold text-outline uppercase tracking-wider">{d.year}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* --- LEFT COLUMN --- */}
          <div className="flex flex-col gap-8">
            {/* CAREER TIMELINE (REPLACING EDUCATION AND AWARDS) */}
            <section>
              <SectionHeader title="Career Milestones" />
              <div className="relative pl-[22px] border-l-2 border-outline-variant/30 py-4 space-y-8 my-2">
                {timelineData.map((node, i) => (
                  <div key={i} className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute -left-[28.5px] top-1.5 h-3 w-3 rounded-full ring-[4px] ring-surface bg-surface transition-transform group-hover:scale-125 ${node.type === 'award' ? 'border-[3px] border-[#E8580A]' : 'border-[3px] border-[#2563EB]'}`} />
                    <div className="space-y-1 bg-surface-container-low/30 p-3 rounded-r-xl border border-transparent group-hover:border-outline-variant/30 transition-colors">
                      <span className="font-label text-[10px] font-bold text-outline tracking-wider">{node.year}</span>
                      <h4 className="font-headline text-[15px] font-bold text-primary leading-tight">{node.title}</h4>
                      <p className="font-body text-[13px] text-secondary">{node.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="flex flex-col gap-8">
            <section>
              <SectionHeader title="Recent Publications" count={facultyProfile.journalPapers.length} />
              <ExpandableList
                items={facultyProfile.journalPapers}
                renderItem={(paper, idx) => (
                  <div key={idx} className="mb-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-colors hover:border-primary/30 group">
                    <h4 className="font-headline text-[14px] font-bold text-primary leading-snug group-hover:text-blue-700 transition-colors">
                      {paper.title}
                      {paper.index === "SCI" && (
                        <span className="ml-[8px] inline-block rounded bg-blue-100 px-1.5 py-0.5 font-label text-[9px] font-bold text-blue-800 align-middle tracking-wider">SCI</span>
                      )}
                      {paper.index === "Scopus" && (
                         <span className="ml-[8px] inline-block rounded bg-purple-100 px-1.5 py-0.5 font-label text-[9px] font-bold text-purple-800 align-middle tracking-wider">Scopus</span>
                      )}
                    </h4>
                    <p className="mt-2 font-body text-[12px] text-secondary">
                      {paper.journal}
                      {paper.doi && ` • ${paper.doi}`}
                    </p>
                  </div>
                )}
              />
            </section>

            <section>
              <SectionHeader title="Invited Talks" count={facultyProfile.invitedTalks.length} />
              <ExpandableList
                items={facultyProfile.invitedTalks}
                renderItem={(talk, idx) => (
                  <div key={idx} className="mb-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm transition-colors hover:border-primary/30">
                    <h4 className="flex items-center gap-2 font-headline text-[14px] font-bold text-primary">
                      {talk.topic}
                      {talk.mode === "online" ? (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 font-label text-[9px] font-bold uppercase tracking-wider text-green-800">Online</span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-label text-[9px] font-bold uppercase tracking-wider text-slate-600">Offline</span>
                      )}
                    </h4>
                    <p className="mt-2 font-body text-[12px] text-secondary">
                      {talk.event} • {talk.date}
                    </p>
                  </div>
                )}
              />
            </section>

            <section>
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-6 shadow-md mt-4">
                <h3 className="mb-5 font-headline text-[16px] font-bold text-primary">
                  Send a message to Dr. Makdey
                </h3>
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <input type="text" placeholder="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary" />
                  <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary" />
                  <input type="text" placeholder="Subject" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary" />
                  <textarea placeholder="Message" rows={4} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary" />
                  <button type="submit" className="mt-2 w-full rounded-lg bg-primary py-3.5 font-headline text-[14px] font-bold text-on-primary shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]">
                    Send Message
                  </button>
                  <p className="mt-2 text-center font-label text-[10px] uppercase tracking-wide text-outline">
                    Your email will not be shared with anyone.
                  </p>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto w-full bg-slate-100/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between border-t border-outline-variant/20 px-6 py-6 md:flex-row md:px-12">
          <div className="font-label text-[10px] uppercase tracking-wide text-slate-500">
            © 2026 FPMP - FR. CONCEICAO RODRIGUES COLLEGE OF ENGINEERING
          </div>
          <div className="mt-4 flex gap-8 md:mt-0">
            <Link className="nav-link font-label text-[10px] uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-600" href="/privacy">Privacy Policy</Link>
            <Link className="nav-link font-label text-[10px] uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-600" href="/terms">Terms of Service</Link>
            <Link className="nav-link font-label text-[10px] uppercase tracking-wide text-slate-500 transition-colors hover:text-blue-600" href="/contact">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
