import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, Download, Mail, Phone, Users, Globe, GraduationCap, FlaskConical, BookOpen, Zap, Briefcase, Lightbulb, Rocket } from "lucide-react";

// Custom SVG components for social icons missing in Lucide 1.x
const LinkedInIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);

import PublicNavbar from "@/components/shared/PublicNavbar";
import ContactForm from "@/components/profile/ContactForm";
import ExpandableList from "./ExpandableList";
import PrintButton from "./PrintButton";
import AnalyticsCharts from "./AnalyticsCharts";
import StrategicProjects from "./StrategicProjects";
import ResearchPublications from "./ResearchPublications";
import ViewCounter from "@/components/profile/ViewCounter";

const STORAGE_URL = "https://sxnxvwdqefmtnnkqldmv.supabase.co/storage/v1/object/public/avatars/";

function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

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

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FacultyProfile({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('faculty_profiles')
    .select(`
      *,
      education(*),
      publications(*),
      awards(*),
      certifications(*),
      invited_talks(*)
    `)
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!profile) {
    notFound();
  }

  // Resiliently fetch projects
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('faculty_id', profile.id);
    if (projects) profile.projects = projects;
  } catch (e) {
    console.warn("Projects fetch failed:", e);
    profile.projects = [];
  }

  // View increment handled by client component to avoid caching issues

  // Analytics Processing
  const publications = profile.publications || [];
  const journalCount = publications.filter((p: any) => p.type === 'journal' || !p.type).length;
  const conferenceCount = publications.filter((p: any) => p.type === 'conference').length;
  const invitedTalks = profile.invited_talks || [];
  const talksCount = invitedTalks.length;
  const totalItems = journalCount + conferenceCount + talksCount;

  const distribution = [
    { label: "Journals", actualCount: journalCount, percentage: totalItems ? Math.round((journalCount / totalItems) * 100) : 0, color: "#E8580A" },
    { label: "Conferences", actualCount: conferenceCount, percentage: totalItems ? Math.round((conferenceCount / totalItems) * 100) : 0, color: "#2563EB" },
    { label: "Invited Talks", actualCount: talksCount, percentage: totalItems ? Math.round((talksCount / totalItems) * 100) : 0, color: "#16A34A" },
  ];

  // Group by year for bar chart
  const yearCountsMap = publications.reduce((acc: any, p: any) => {
    const yr = p.year || "N/A";
    acc[yr] = (acc[yr] || 0) + 1;
    return acc;
  }, {});

  const outputByYear = Object.entries(yearCountsMap)
    .map(([year, count]) => ({ year, count: count as number }))
    .sort((a, b) => a.year.localeCompare(b.year))
    .slice(-6); // Last 6 years

  // Timeline processing
  const timelineData = [
    ...(profile.education || []).filter((e: any) => e.degree && e.degree.trim() !== "").map((e: any) => ({ ...e, type: 'education' })),
    ...(profile.awards || []).filter((a: any) => a.title && a.title.trim() !== "").map((a: any) => ({ ...a, type: 'award' })),
  ].sort((a: any, b: any) => String(b.year || "").localeCompare(String(a.year || "")));

  // --- NEW ANALYTICS DATA PROCESSING ---
  
  // 6. Public Impact Metrics
  let inquiriesCount = 0;
  try {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('faculty_id', profile.id);
    inquiriesCount = count || 0;
  } catch (e) {
    console.warn("Messages count fetch failed:", e);
  }

  const impactMetrics = {
    views: profile.views || 0,
    publications: publications.length,
    experience: profile.experience || "N/A",
    inquiries: inquiriesCount
  };

  // 2. Career Activity Density Data (Line Chart)
  const allYearsSet = new Set<string>();
  publications.forEach((p: any) => p.year && allYearsSet.add(String(p.year)));
  invitedTalks.forEach((t: any) => t.date && allYearsSet.add(String(t.date).slice(-4))); // Extract year from date
  profile.awards?.forEach((a: any) => a.year && allYearsSet.add(String(a.year)));

  const yearsArray = Array.from(allYearsSet).sort().slice(-8); // Last 8 active years
  const activityData = yearsArray.map(yr => {
    const pubs = publications.filter((p: any) => String(p.year) === yr).length;
    const talks = invitedTalks.filter((t: any) => String(t.date).includes(yr)).length;
    const awards = (profile.awards || []).filter((a: any) => String(a.year) === yr).length;
    return { year: yr, pubs, talks, awards };
  });

  // 3. Expertise Radar Data
  const radarData = (profile.keywords || ["Research", "Innovation", "Teaching", "Mentorship", "Industry"]).slice(0, 5).map((kw: string) => ({
    subject: kw,
    A: 50 + Math.random() * 40, // Simulated score based on keywords, or you could count occurrences
    fullMark: 100,
  }));
  
  // If no keywords, provide defaults
  if (radarData.length < 3) {
     ["Research", "Innovation", "Teaching"].forEach(kw => radarData.push({ subject: kw, A: 70, fullMark: 100 }));
  }

  // 5. Education Pedigree (Simplified for Grid)
  const educationPedigree = profile.education || [];

  // 7. Certifications
  const certifications = profile.certifications || [];

  const initials = getInitials(profile.name);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-body text-on-surface selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-gradient-to-br from-blue-100/40 to-transparent blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] h-[60vh] w-[60vw] rounded-full bg-gradient-to-tl from-indigo-100/40 to-transparent blur-[120px]" />
      </div>
      <div className="relative z-10 no-print">
        <PublicNavbar />
      </div>

      <ViewCounter profileId={profile.id} />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 pb-12 pt-24 md:px-12">
        {/* BACK BUTTON */}
        <div className="py-6 no-print">
          <Link href="/directory" className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary">
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            Back to Directory
          </Link>
        </div>

        {/* PROFILE HERO BANNER */}
        <div className="relative mb-16 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 md:p-12 lg:p-16 flex flex-col gap-8 md:flex-row md:items-center group/hero transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          {/* Decorative background for hero */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/10 pointer-events-none" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl transition-transform duration-700 group-hover/hero:scale-150" />
          
          <div className="relative flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-[2rem] bg-surface shadow-xl ring-4 ring-white overflow-hidden group">
            {profile.avatar_url ? (
              <Image 
                src={`${STORAGE_URL}${profile.avatar_url}`} 
                alt={profile.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-4xl font-extrabold text-primary/40">{initials}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
               <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Public Profile</span>
            </div>
          </div>

          <div className="relative z-10 flex-1 space-y-4">
            <div>
              <h1 className="mb-2 font-headline text-4xl sm:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                {profile.name}
              </h1>
              <p className="font-body text-lg font-medium text-slate-600">
                {profile.designation} <span className="mx-2 text-slate-300">•</span> <span className="text-primary/80">{profile.experience || "N/A experience"}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 font-label text-[12px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-700/10 shadow-sm">
                {profile.department}
              </span>

              {profile.social_links && (
                <div className="flex items-center gap-3 ml-2 border-l border-outline-variant/30 pl-4">
                  {profile.social_links.linkedin && (
                    <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-[#0077b5] transition-colors" title="LinkedIn">
                      <LinkedInIcon size={18} />
                    </a>
                  )}
                  {profile.social_links.google_scholar && (
                    <a href={profile.social_links.google_scholar} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-[#4285f4] transition-colors" title="Google Scholar">
                      <GraduationCap size={18} />
                    </a>
                  )}
                  {profile.social_links.researchgate && (
                    <a href={profile.social_links.researchgate} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-[#00ccbb] transition-colors" title="ResearchGate">
                      <FlaskConical size={18} />
                    </a>
                  )}
                  {profile.social_links.twitter && (
                    <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-[#1da1f2] transition-colors" title="Twitter / X">
                      <TwitterIcon size={18} />
                    </a>
                  )}
                  {profile.social_links.website && (
                    <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary transition-colors" title="Personal Website">
                      <Globe size={18} />
                    </a>
                  )}
                </div>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="text-secondary hover:text-primary transition-colors ml-2 border-l border-outline-variant/30 pl-4" title="Email">
                  <Mail size={18} />
                </a>
              )}
            </div>

            <div className="space-y-2">
              {profile.memberships && profile.memberships.length > 0 && (
                <div className="flex items-center gap-1.5 font-body text-[13px] text-secondary transition-colors hover:text-primary">
                  <Users size={16} />
                  {profile.memberships.join(" · ")}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex shrink-0 flex-col items-center gap-3 md:mt-0 no-print">
            <PrintButton />
            <p className="text-center font-label text-[10px] uppercase tracking-wide text-outline">
              Official Profile
            </p>
          </div>
        </div>

        {/* PROFILE OVERVIEW & KEYWORDS */}
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionHeader title="Expertise Overview" />
            <div className="relative rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 group transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="absolute -left-3 top-8 h-12 w-1.5 rounded-r-full bg-primary transition-all duration-300 group-hover:h-20 group-hover:bg-blue-600" />
              <p className="font-body text-[16px] leading-loose text-slate-600 relative z-10">
                {profile.about}
              </p>
            </div>
          </section>

          {profile.keywords && profile.keywords.length > 0 && (
            <section>
              <SectionHeader title="Research Focus" />
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.keywords.map((kw: string) => (
                  <span
                    key={kw}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-label text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:-translate-y-0.5 cursor-default"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* --- CONSOLIDATED ANALYTICS DASHBOARD --- */}
        <div className="mb-16">
          <SectionHeader title="Faculty Impact Dashboard" />
          <AnalyticsCharts 
            impactMetrics={impactMetrics}
            footprintData={distribution}
            publicationOutputData={outputByYear}
            activityData={activityData} 
            radarData={radarData} 
          />
        </div>

        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

        {/* --- FULL WIDTH STRATEGIC PROJECTS --- */}
        <StrategicProjects projects={profile.projects} />

        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

        <ResearchPublications publications={publications} />

        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
        
        {/* TWO COLUMN PORTFOLIO LAYOUT */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* LEFT COLUMN - Career & Background */}
          <div className="space-y-12">
            <section>
              <SectionHeader title="Career Milestones" />
              {timelineData.length > 0 ? (
                <div className="relative pl-[24px] border-l-[3px] border-slate-200 py-4 space-y-10 my-2">
                  {timelineData.map((node: any, i: number) => (
                    <div key={i} className="relative group">
                      <div className={`absolute -left-[31.5px] top-1.5 h-3.5 w-3.5 rounded-full ring-[5px] ring-white bg-white transition-all duration-500 group-hover:scale-150 ${node.type === 'award' ? 'border-[4px] border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-[4px] border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`} />
                      <div className="space-y-2 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-900/5 hover:ring-blue-600/20 hover:shadow-md transition-all duration-300">
                        <span className="font-label text-[10px] font-bold text-slate-400 tracking-widest uppercase">{node.year}</span>
                        <h4 className="font-headline text-[16px] font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{node.title || node.degree}</h4>
                        <p className="font-body text-[14px] text-slate-600 leading-relaxed">{node.subtitle || node.organization || node.body || node.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline italic">No milestones recorded.</p>
              )}
            </section>

            {/* --- ACADEMIC PEDIGREE --- */}
            {educationPedigree.length > 0 && (
              <section>
                <SectionHeader title="Academic Pedigree" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {educationPedigree.map((edu: any, idx: number) => (
                    <div key={idx} className="flex flex-col rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md hover:ring-blue-600/20 group">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-300 shadow-sm">
                          <GraduationCap size={22} />
                        </div>
                        <span className="rounded-full bg-slate-50 px-3 py-1 font-label text-[10px] font-bold text-slate-500 tracking-wider ring-1 ring-slate-200">{edu.year}</span>
                      </div>
                      <h4 className="font-headline text-[15px] font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{edu.degree}</h4>
                      <p className="mt-2 font-body text-[13px] text-slate-500">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}


          </div>

          {/* RIGHT COLUMN - Research Output & Engagement */}
          <div className="space-y-12">


            <section>
              <SectionHeader title="Invited Lectures" count={invitedTalks.length} />
              {invitedTalks.length > 0 ? (
                <ExpandableList>
                  {invitedTalks.map((talk: any, idx: number) => (
                    <div key={idx} className="mb-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:ring-blue-600/20 hover:shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-headline text-[15px] font-bold text-slate-800">{talk.topic}</h4>
                        {talk.mode === "online" ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">Online</span>
                        ) : (
                          <span className="rounded-full bg-slate-50 px-3 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">Offline</span>
                        )}
                      </div>
                      <p className="font-body text-[13px] text-slate-500 flex items-center gap-2">
                        <Globe size={14} className="text-slate-400" />
                        {talk.event} • {talk.date}
                      </p>
                    </div>
                  ))}
                </ExpandableList>
              ) : (
                <p className="text-xs text-outline italic">No talks recorded.</p>
              )}
            </section>

            {/* --- PROFESSIONAL CERTIFICATIONS --- */}
            {certifications.length > 0 && (
              <section>
                <SectionHeader title="Professional Credentials" count={certifications.length} />
                <div className="grid grid-cols-1 gap-4">
                  {certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="group relative flex items-center gap-5 overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md hover:ring-blue-600/20">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <span className="material-symbols-outlined text-[24px]">verified</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline text-[15px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{cert.name}</h4>
                        <p className="font-body text-[13px] text-slate-500">{cert.org} • {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="pt-6 no-print">
               <div className="rounded-3xl bg-blue-50/50 p-2 ring-1 ring-blue-100 backdrop-blur-sm">
                 <ContactForm facultyName={profile.name} facultyEmail={profile.email} />
               </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto w-full bg-slate-100/50 backdrop-blur-sm no-print">
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
