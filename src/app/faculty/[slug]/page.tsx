import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_noStore as noStore } from "next/cache";
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
import PublicFooter from "@/components/shared/PublicFooter";
import ContactForm from "@/components/profile/ContactForm";
import ExpandableList from "./ExpandableList";
import PrintButton from "./PrintButton";
import AnalyticsCharts from "./AnalyticsCharts";
import StrategicProjects from "./StrategicProjects";
import ResearchPublications from "./ResearchPublications";
import ViewCounter from "@/components/profile/ViewCounter";
import ActivityGallery from "./ActivityGallery";

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

  // Resiliently fetch gallery
  try {
    const { data: galleryData } = await supabase
      .from('faculty_gallery')
      .select('*')
      .eq('faculty_id', profile.id)
      .order('order_index', { ascending: true });
    profile.faculty_gallery = galleryData || [];
  } catch (e) {
    console.warn("Gallery fetch failed:", e);
    profile.faculty_gallery = [];
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
  noStore();
  let inquiriesCount = 0;
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { count } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_faculty', profile.id)
      .like('body', 'From:%');
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
  const radarData = (profile.keywords || ["Research", "Innovation", "Teaching", "Mentorship", "Industry"]).slice(0, 5).map((kw: string) => {
    // Calculate a stable score based on activity and a keyword-specific hash
    const pubMentions = publications.filter((p: any) => 
      (p.title || "").toLowerCase().includes(kw.toLowerCase()) || 
      (p.venue || p.journal || "").toLowerCase().includes(kw.toLowerCase())
    ).length;
    
    const projMentions = (profile.projects || []).filter((p: any) => 
      (p.title || "").toLowerCase().includes(kw.toLowerCase()) || 
      (p.description || "").toLowerCase().includes(kw.toLowerCase())
    ).length;

    // Stable hash-based base score so it doesn't jump on refresh
    const hash = kw.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseScore = 65 + (hash % 15); // 65-80
    
    // Add weight for actual mentions in their portfolio
    const activityBonus = Math.min((pubMentions * 4) + (projMentions * 6), 20);

    return {
      subject: kw,
      A: Math.min(baseScore + activityBonus, 95),
      fullMark: 100,
    };
  });
  
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
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      <div className="no-print">
        <PublicNavbar />
      </div>

      <ViewCounter profileId={profile.id} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-20 md:px-12 md:pb-12 md:pt-24">
        {/* PROFILE HERO BANNER */}
        <div className="mb-6 flex flex-col gap-6 overflow-hidden rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-surface-container-high to-surface-container-highest p-5 shadow-sm md:mb-10 md:flex-row md:items-start md:gap-8 md:p-8">
          <div className="relative mx-auto flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-2xl bg-surface shadow-md border-4 border-surface overflow-hidden group md:mx-0 md:h-[220px] md:w-[220px]">
            {profile.avatar_url ? (
              <Image 
                src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${STORAGE_URL}${profile.avatar_url}`} 
                alt={profile.name} 
                fill 
                className="object-cover"
                unoptimized={profile.avatar_url.includes('googleusercontent.com')}
              />
            ) : (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-primary opacity-40">{initials}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">Public Profile</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="mb-1 font-headline text-[24px] font-extrabold tracking-tighter text-primary md:text-[32px]">
              {profile.name}
            </h1>
            <p className="mb-4 font-body text-sm font-medium text-secondary md:text-[15px]">
              {profile.designation} — {profile.experience || "N/A experience"}
            </p>

            <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span className="rounded-md bg-primary px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-on-primary md:text-[11px]">
                {profile.department}
              </span>

              {profile.social_links && (
                <div className="flex items-center gap-3 ml-0 border-l-0 pl-0 border-outline-variant/30 md:ml-2 md:border-l md:pl-4">
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
                <a href={`mailto:${profile.email}`} className="text-secondary hover:text-primary transition-colors ml-0 border-l-0 pl-0 md:ml-2 md:border-l md:border-outline-variant/30 md:pl-4" title="Email">
                  <Mail size={18} />
                </a>
              )}
            </div>

            <div className="space-y-2">
              {profile.memberships && profile.memberships.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 font-body text-[12px] text-secondary transition-colors hover:text-primary md:justify-start md:text-[13px]">
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

        {/* TOP SECTION: GALLERY & PEDIGREE */}
        <div className={`mb-8 grid grid-cols-1 gap-6 md:mb-12 md:gap-10 ${profile.faculty_gallery?.length > 0 ? "lg:grid-cols-2" : ""}`}>
          {profile.faculty_gallery?.length > 0 && (
            <div className="w-full">
              <ActivityGallery items={profile.faculty_gallery} />
            </div>
          )}
          
          <div className="w-full">
            {educationPedigree.length > 0 && (
              <section className="flex flex-col h-full">
                <SectionHeader title="Academic Pedigree" />
                <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 hide-scrollbar h-[280px] sm:grid-cols-2">
                  {educationPedigree.map((edu: any, idx: number) => (
                    <div key={idx} className="flex flex-col rounded-2xl border border-outline-variant/20 bg-gradient-to-br from-surface to-surface-container-low p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <GraduationCap size={20} />
                        </div>
                        <span className="font-label text-[11px] font-bold text-outline tracking-wider">{edu.year}</span>
                      </div>
                      <h4 className="font-headline text-[14px] font-bold text-primary leading-tight">{edu.degree}</h4>
                      <p className="mt-1 font-body text-[12px] text-secondary opacity-80">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* PROFILE OVERVIEW & KEYWORDS */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:mb-12 md:gap-10 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionHeader title="Expertise Overview" />
            <div className="relative rounded-2xl bg-surface-container-low/20 p-1">
              <p className="font-body text-sm leading-relaxed text-secondary border-l-[3px] border-primary/60 pl-4 py-2 md:text-[15px] md:border-l-[4px] md:pl-6">
                {profile.about}
              </p>
            </div>
          </section>

          {profile.keywords && profile.keywords.length > 0 && (
            <section>
              <SectionHeader title="Research Focus" />
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.keywords?.map((kw: string) => (
                  <span
                    key={kw}
                    className="rounded-full border border-outline-variant/30 bg-surface px-4 py-1.5 font-label text-[10px] font-bold uppercase tracking-wider text-secondary transition-all hover:border-primary/50 hover:text-primary"
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
        {profile.projects?.length > 0 && (
          <>
            <StrategicProjects projects={profile.projects} />
            <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
          </>
        )}

        {publications?.length > 0 && (
          <>
            <ResearchPublications publications={publications} />
            <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
          </>
        )}
        
        {/* TWO COLUMN PORTFOLIO LAYOUT */}
        <div className={`grid grid-cols-1 gap-10 ${timelineData.length > 0 ? "lg:grid-cols-2" : ""}`}>
          {/* LEFT COLUMN - Career & Background */}
          <div className="space-y-12">
            {timelineData.length > 0 && (
              <section>
                <SectionHeader title="Career Milestones" />
                <div className="relative pl-[24px] border-l-[3px] border-outline-variant/20 py-4 space-y-10 my-2">
                  {timelineData.map((node: any, i: number) => (
                    <div key={i} className="relative group">
                      <div className={`absolute -left-[31.5px] top-1.5 h-3.5 w-3.5 rounded-full ring-[5px] ring-surface bg-surface transition-all group-hover:scale-125 ${node.type === 'award' ? 'border-[4px] border-[#E8580A]' : 'border-[4px] border-[#2563EB]'}`} />
                      <div className="space-y-2 bg-surface-container-low/20 p-5 rounded-2xl border border-transparent hover:border-outline-variant/30 hover:bg-surface transition-all">
                        <span className="font-label text-[10px] font-bold text-outline tracking-widest uppercase">{node.year}</span>
                        <h4 className="font-headline text-[16px] font-black text-primary leading-tight">{node.title || node.degree}</h4>
                        <p className="font-body text-[14px] text-secondary leading-relaxed">{node.subtitle || node.organization || node.body || node.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN - Research Output & Engagement */}
          <div className="space-y-12">
            {invitedTalks.length > 0 && (
              <section>
                <SectionHeader title="Invited Lectures" count={invitedTalks.length} />
                <ExpandableList>
                  {invitedTalks.map((talk: any, idx: number) => (
                    <div key={idx} className="mb-4 rounded-2xl border border-outline-variant/20 bg-surface p-6 transition-all hover:border-primary/30 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-headline text-[15px] font-bold text-primary">{talk.topic}</h4>
                        {talk.mode === "online" ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">Online</span>
                        ) : (
                          <span className="rounded-full bg-slate-50 px-3 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">Offline</span>
                        )}
                      </div>
                      <p className="font-body text-[13px] text-secondary flex items-center gap-2">
                        <Globe size={14} className="text-outline" />
                        {talk.event} • {talk.date}
                      </p>
                    </div>
                  ))}
                </ExpandableList>
              </section>
            )}

            {/* --- PROFESSIONAL CERTIFICATIONS --- */}
            {certifications.length > 0 && (
              <section>
                <SectionHeader title="Professional Credentials" count={certifications.length} />
                <div className="grid grid-cols-1 gap-4">
                  {certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[24px]">verified</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline text-[15px] font-bold text-primary">{cert.name}</h4>
                        <p className="font-body text-[12px] text-secondary opacity-70">{cert.org} • {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* --- CUSTOM SECTIONS (ADDITIONAL INFO) --- */}
            {profile.custom_sections && profile.custom_sections.length > 0 && (
              <div className="space-y-12">
                {profile.custom_sections.map((section: any, idx: number) => (
                  <section key={idx}>
                    <SectionHeader title={section.title || "Additional Information"} />
                    <div className="rounded-2xl bg-surface-container-low/20 p-6 border border-outline-variant/10 shadow-sm transition-all hover:shadow-md hover:border-primary/10">
                      <p className="font-body text-[14px] leading-relaxed text-secondary whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  </section>
                ))}
              </div>
            )}

            <section className="pt-6 no-print">
               <div className="rounded-3xl bg-primary/5 p-1">
                 <ContactForm facultyName={profile.name} facultyEmail={profile.email} />
               </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
