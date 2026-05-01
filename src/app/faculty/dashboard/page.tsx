"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import FacultyLayout from "@/components/faculty/FacultyLayout";

const calculateCompletion = (profile: any) => {
  let score = 0;
  if (profile.name && profile.email && profile.department) score += 10;
  if (profile.about && profile.about.length > 20) score += 15;
  if (profile.education && profile.education.length > 0) score += 10;
  if (profile.publications && profile.publications.length > 0) score += 20;
  if (profile.keywords && profile.keywords.length > 0) score += 10;
  if (profile.awards && profile.awards.length > 0) score += 10;
  if (profile.certifications && profile.certifications.length > 0) score += 10;
  if (profile.invited_talks && profile.invited_talks.length > 0) score += 10;
  if (profile.social_links && Object.keys(profile.social_links).length > 0) score += 5;
  return score;
};

const getSectionsStatus = (profile: any) => [
  { name: "Basic Info", status: (profile.name && profile.email && profile.department) ? "Done" : "Empty" },
  { name: "About/Overview", status: profile.about ? "Done" : "Empty" },
  { name: "Education", status: (profile.education?.length > 0) ? "Done" : "Empty" },
  { name: "Publications", status: (profile.publications?.length > 0) ? "Done" : "Empty" },
  { name: "Research Keywords", status: (profile.keywords?.length > 0) ? "Done" : "Empty" },
  { name: "Awards", status: (profile.awards?.length > 0) ? "Done" : "Empty" },
  { name: "Certifications/FDPs", status: (profile.certifications?.length > 0) ? "Done" : "Empty" },
  { name: "Invited Talks", status: (profile.invited_talks?.length > 0) ? "Done" : "Empty" },
  { name: "Social Links", status: (profile.social_links && Object.keys(profile.social_links).length > 0) ? "Done" : "Empty" },
];

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First try the complex query
        let { data: profileData, error } = await supabase
          .from('faculty_profiles')
          .select(`*, education(*), publications(*), awards(*), certifications(*), invited_talks(*), 
            messages!messages_to_faculty_fkey(
              id, subject, body, is_read, sent_at
            )`)
          .eq('user_id', user.id)
          .single();

        // If it fails with a relationship error, try without messages
        if (error && (error.code === 'PGRST108' || error.message.includes('relationship'))) {
          console.warn("Messages relationship not found, retrying without messages...");
          const { data: simpleData, error: simpleError } = await supabase
            .from('faculty_profiles')
            .select(`*, education(*), publications(*), awards(*), certifications(*), invited_talks(*)`)
            .eq('user_id', user.id)
            .single();
          
          profileData = simpleData;
          error = simpleError;
        }

        if (error) {
          console.error("Error fetching profile:", error);
          setDebugInfo({ 
            error: error.message, 
            code: error.code, 
            userId: user.id,
            hint: error.hint,
            details: error.details
          });
          setLoading(false);
          return;
        }

        const score = calculateCompletion(profileData);
        if (profileData.completion !== score) {
          await supabase
            .from('faculty_profiles')
            .update({ completion: score })
            .eq('id', profileData.id);
          profileData.completion = score;
        }

        setProfile(profileData);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const sections = profile ? getSectionsStatus(profile) : [];
  const unreadCount = profile?.messages?.filter((m: any) => !m.is_read).length || 0;
  const recentMessages = profile?.messages?.sort((a: any, b: any) => 
    new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  ).slice(0, 2) || [];

  if (loading) {
    return (
      <FacultyLayout>
        <div className="mx-6 mt-6 h-12 rounded-lg bg-slate-100 animate-pulse" />
        <div className="px-6 pt-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="lg:col-span-2 h-[300px] rounded-xl" />
          </div>
        </div>
      </FacultyLayout>
    );
  }

  if (debugInfo) {
    return (
      <FacultyLayout>
        <div className="mx-6 mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            <span className="material-symbols-outlined text-[32px]">person_off</span>
          </div>
          <h2 className="font-headline text-2xl font-extrabold text-primary">Profile Entry Not Found</h2>
          <p className="mt-3 max-w-md font-body text-[15px] text-secondary">
            You are logged in as <span className="font-bold text-primary">{debugInfo.userId}</span>, but we couldn't find a faculty profile record linked to this ID in the database.
          </p>
          
          <div className="mt-8 flex flex-col gap-3">
             <div className="rounded-lg bg-surface-container-high p-4 text-left">
               <p className="font-label text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Checklist for Admin:</p>
               <ul className="list-disc list-inside font-body text-[13px] text-secondary space-y-1 mb-3">
                 <li>Ensure user role is 'faculty' in Auth Metadata</li>
                 <li>Check if <code className="bg-surface/50 px-1 rounded">faculty_profiles</code> table has a record with <code className="bg-surface/50 px-1 rounded">user_id</code> = <span className="font-bold">{debugInfo.userId}</span></li>
                 <li>Verify RLS policies on the <code className="bg-surface/50 px-1 rounded">faculty_profiles</code> table</li>
               </ul>
               <div className="mt-3 border-t border-outline-variant/30 pt-3">
                 <p className="font-label text-[11px] font-bold uppercase tracking-wider text-red-700 mb-1">Raw Database Error:</p>
                 <p className="font-mono text-[11px] text-red-600 bg-red-50 p-2 rounded">
                   [{debugInfo.code}] {debugInfo.error}
                 </p>
                 {debugInfo.hint && <p className="mt-1 font-body text-[10px] text-red-500 italic">Hint: {debugInfo.hint}</p>}
               </div>
             </div>
             
             <button 
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-primary px-6 py-2.5 font-headline text-[13px] font-bold text-on-primary shadow-sm"
             >
                Retry Loading
             </button>
          </div>
        </div>
      </FacultyLayout>
    );
  }

  if (!profile) return <div>Unexpected error loading dashboard.</div>;

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

  const yearCountsMap = publications.reduce((acc: any, p: any) => {
    const yr = p.year || "N/A";
    acc[yr] = (acc[yr] || 0) + 1;
    return acc;
  }, {});

  const outputByYear = Object.entries(yearCountsMap)
    .map(([year, count]) => ({ year, count: count as number }))
    .sort((a, b) => a.year.localeCompare(b.year))
    .slice(-6);

  return (
    <FacultyLayout>

      {/* PAGE HEADER */}
      <div className="px-6 pt-6">
        <h1 className="font-headline text-[22px] font-bold tracking-tight text-primary">
          Welcome back, {profile.name}
        </h1>
        <p className="mt-1 font-body text-[14px] text-secondary">
          Your profile status: <span className="font-bold text-primary capitalize">{profile.status}</span>
        </p>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Profile Completion */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 border-l-[3px] border-l-primary bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-headline text-[13px] font-extrabold uppercase tracking-wider text-outline">
            Profile Completion
          </div>
          <div className="font-headline text-[28px] font-bold text-primary">
            {profile.completion}%
          </div>
          <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-primary" style={{ width: `${profile.completion}%` }} />
          </div>
        </div>

        {/* Card 2: Profile Status */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-headline text-[13px] font-extrabold uppercase tracking-wider text-outline">
            Profile Status
          </div>
          <div>
            <span className={`inline-block rounded-md px-2.5 py-1 font-label text-[11px] font-bold uppercase tracking-wider ${
              profile.status === 'approved' ? 'bg-green-100 text-green-800' : 
              profile.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
            }`}>
              {profile.status}
            </span>
          </div>
          <div className="mt-auto pt-2 font-body text-[12px] text-secondary capitalize">
            {profile.department}
          </div>
        </div>

        {/* Card 3: Public Views */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-headline text-[13px] font-extrabold uppercase tracking-wider text-outline">
            Public Views
          </div>
          <div className="font-headline text-[28px] font-bold text-primary">
            {profile.views || 0}
          </div>
          <div className="mt-auto font-body text-[12px] text-secondary">
            Total lifetime views
          </div>
        </div>

        {/* Card 4: Unread Messages */}
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-2 font-headline text-[13px] font-extrabold uppercase tracking-wider text-outline">
            Unread Messages
          </div>
          <div className="font-headline text-[28px] font-bold text-primary">
            {unreadCount}
          </div>
          <div className="mt-auto font-body text-[12px] text-secondary">
            From administrator
          </div>
        </div>
      </div>

      {/* ACADEMIC IMPACT & OUTPUT */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Research Footprint Donut */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm flex flex-col items-center">
            <h3 className="font-headline text-[18px] font-extrabold text-primary w-full mb-6 md:text-[20px]">Research Footprint</h3>
            <div className="relative h-[140px] w-[140px] rounded-full overflow-hidden mb-6 sm:h-[160px] sm:w-[160px]" style={{
              background: `conic-gradient(
                #E8580A 0% ${distribution[0].percentage}%, 
                #2563EB ${distribution[0].percentage}% ${distribution[0].percentage + distribution[1].percentage}%, 
                #16A34A ${distribution[0].percentage + distribution[1].percentage}% 100%
              )`
            }}>
              <div className="absolute inset-0 m-auto h-[90px] w-[90px] rounded-full bg-surface-container-lowest flex flex-col items-center justify-center shadow-inner sm:h-[110px] sm:w-[110px]">
                <span className="font-headline text-[24px] font-bold text-primary leading-none sm:text-[28px]">{totalItems}</span>
                <span className="font-label text-[8px] uppercase font-bold text-outline mt-1 tracking-widest sm:text-[9px]">Items</span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2.5">
              {distribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between font-body text-[11px] md:text-[12px]">
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
          <div className="lg:col-span-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm flex flex-col">
            <h3 className="font-headline text-[18px] font-extrabold text-primary mb-6 md:text-[20px]">Publication Output</h3>
            <div className="flex-1 flex items-end justify-between gap-2 h-[180px] w-full border-b border-outline-variant/30 pb-3">
              {outputByYear.length > 0 ? outputByYear.map((d, i) => {
                const max = Math.max(...outputByYear.map(x => x.count));
                const heightPct = (d.count / max) * 100;
                const finalHeight = Math.max(heightPct, 5); 
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full gap-2 group flex-1">
                    <span className="font-headline text-[12px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 sm:text-[13px]">{d.count}</span>
                    <div className="w-full max-w-[48px] bg-primary-container disabled-lighten rounded-t-lg group-hover:bg-primary transition-all duration-300 relative overflow-hidden" style={{ height: `${finalHeight}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
                    </div>
                    <span className="font-label text-[9px] font-bold text-outline uppercase tracking-wider sm:text-[10px]">{d.year}</span>
                  </div>
                )
              }) : (
                <div className="flex h-full w-full items-center justify-center text-outline text-xs uppercase tracking-widest">No publication data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
        {/* --- LEFT CARD: Profile Completion Details --- */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h3 className="font-headline text-[20px] font-extrabold text-primary">
              Profile Completion
            </h3>
            <span className="font-headline text-[15px] font-bold text-primary">
              {profile.completion}%
            </span>
          </div>
          <div className="flex flex-col">
            {sections.map((section: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-outline-variant/20 py-2.5 last:border-0"
              >
                <span className="font-body text-[13px] font-medium text-secondary">
                  {section.name}
                </span>
                <StatusBadge status={section.status as any} />
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN (Two stacked cards) --- */}
        <div className="flex flex-col gap-6">
          {/* TOP: AI Smart Nudges */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-headline text-[20px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[18px] text-primary">
                tips_and_updates
              </span>
              AI Smart Nudges
            </h3>

            {profile.completion < 100 ? (
              <>
                {!profile.certifications?.length && (
                  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <h4 className="mb-1 font-headline text-[13px] font-bold text-blue-900">
                      Add your Certifications & FDPs
                    </h4>
                    <p className="font-body text-[12px] text-blue-800/80">
                      Faculty with complete records appear higher in search results.
                    </p>
                  </div>
                )}
                {!profile.publications?.length && (
                  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <h4 className="mb-1 font-headline text-[13px] font-bold text-blue-900">
                      Add your Publications
                    </h4>
                    <p className="font-body text-[12px] text-blue-800/80">
                      Sharing your research output increases your academic footprint.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <h4 className="mb-1 font-headline text-[13px] font-bold text-green-900">
                  Your profile is 100% complete!
                </h4>
                <p className="font-body text-[12px] text-green-800/80">
                  Excellent work. Your profile is optimized for maximum visibility.
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM: Recent Messages */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="flex items-center gap-2 font-headline text-[20px] font-extrabold text-primary">
                Recent Messages
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-label text-[10px] font-bold text-on-primary">
                    {unreadCount}
                  </span>
                )}
              </h3>
            </div>

            {recentMessages.length > 0 ? recentMessages.map((msg: any) => (
              <div key={msg.id} className="mb-3 flex items-start gap-3 rounded-lg bg-secondary-container/20 p-3">
                {!msg.is_read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div>
                  <h4 className="font-headline text-[13px] font-bold text-primary">
                    {msg.subject}
                  </h4>
                  <p className="mt-0.5 font-body text-[12px] text-secondary line-clamp-1">
                    {msg.body}
                  </p>
                  <p className="mt-1 font-label text-[10px] uppercase tracking-wide text-outline">
                    Admin · {new Date(msg.sent_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center py-4 font-body text-[13px] text-outline italic">No recent messages.</p>
            )}

            <div className="text-right mt-4">
              <Link
                href="/faculty/messages"
                className="shine-button inline-block font-headline text-[12px] font-bold text-primary transition-all hover:text-blue-600 hover:underline"
              >
                View all messages
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION BUTTONS */}
      <div className="flex flex-col gap-3 px-6 pb-10 sm:flex-row sm:items-center">
        <Link
          href="/faculty/editor"
          className="shine-button flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 font-headline text-[14px] font-bold text-on-primary shadow-sm transition-all active:scale-95 md:text-[15px]"
        >
          Edit Profile
        </Link>
        <Link
          href="/faculty/cv-upload"
          className="shine-button flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container px-5 py-2.5 font-headline text-[14px] font-medium text-secondary shadow-sm transition-all hover:bg-surface-container-high hover:text-primary active:scale-95 md:text-[15px]"
        >
          Upload CV
        </Link>
        <Link
          href={`/faculty/${profile.slug}`}
          className="shine-button flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container px-5 py-2.5 font-headline text-[14px] font-medium text-secondary shadow-sm transition-all hover:bg-surface-container-high hover:text-primary active:scale-95 md:text-[15px]"
        >
          Preview Public Profile
        </Link>
      </div>
    </FacultyLayout>
  );
}

const StatusBadge = ({ status }: { status: "Done" | "Partial" | "Empty" }) => {
  if (status === "Done") {
    return (
      <span className="rounded bg-green-100 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-green-800">
        Done
      </span>
    );
  }
  if (status === "Partial") {
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-amber-800">
        Partial
      </span>
    );
  }
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-slate-600">
      Empty
    </span>
  );
};
