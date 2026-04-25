"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import { Save, Send, Plus, Trash2, CheckCircle2, ChevronRight, Camera, Loader2, XCircle, Sparkles, X, RotateCcw } from "lucide-react";

type Tab = "Basic Info" | "About" | "Education" | "Publications" | "Projects" | "Awards" | "Certifications" | "Keywords" | "Memberships" | "Additional Info";

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
  if (profile.social_links && Object.values(profile.social_links).some(v => v && String(v).trim() !== "")) score += 5;
  return score;
};

export default function FacultyEditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Basic Info");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cvPrefilled, setCvPrefilled] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    designation: "",
    department: "Electronics & CS",
    experience: "",
    email: "",
    phone: "",
    about: "",
    keywords: [] as string[],
    education: [] as any[],
    publications: [] as any[],
    projects: [] as any[],
    awards: [] as any[],
    certifications: [] as any[],
    invited_talks: [] as any[],
    memberships: [] as string[],
    custom_sections: [] as any[],
    avatar_url: "",
    admin_feedback: "",
    note_to_admin: "",
    social_links: {
      linkedin: "",
      google_scholar: "",
      researchgate: "",
      twitter: "",
      website: ""
    }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error } = await supabase
          .from('faculty_profiles')
          .select('*, education(*), publications(*), awards(*), certifications(*), invited_talks(*)')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Base form state from Supabase
        const base = {
          name: profileData.name || "",
          designation: profileData.designation || "",
          department: profileData.department || "Electronics & CS",
          experience: profileData.experience || "",
          email: profileData.email || user.email || "",
          phone: profileData.phone || "",
          about: profileData.about || "",
          keywords: profileData.keywords || [],
          education: (profileData.education || []).map((e: any) => ({ ...e, degree: e.degree || "", institution: e.institution || "", year: e.year || "", field: e.field || "" })),
          publications: (profileData.publications || []).map((p: any) => ({ ...p, title: p.title || "", journal: p.venue || p.journal || "", type: p.type || "journal", year: p.year || "", doi: p.doi || "", index_tag: p.index_tag || "", award: p.award || "" })),
          projects: [] as any[], // Default to empty
          awards: (profileData.awards || []).map((a: any) => ({ ...a, title: a.title || "", organization: a.body || a.organization || "", year: a.year || "" })),
          certifications: (profileData.certifications || []).map((c: any) => ({ ...c, title: c.name || c.title || "", organization: c.org || c.organization || "", year: c.year || "" })),
          invited_talks: profileData.invited_talks || [],
          memberships: profileData.memberships || [],
          custom_sections: profileData.custom_sections || [],
          avatar_url: profileData.avatar_url || "",
          admin_feedback: profileData.admin_feedback || "",
          note_to_admin: profileData.note_to_admin || "",
          social_links: profileData.social_links || {
            linkedin: "",
            google_scholar: "",
            researchgate: "",
            twitter: "",
            website: ""
          }
        };

        // Resiliently fetch projects (might fail if table not created yet)
        try {
          const { data: projData } = await supabase
            .from('projects')
            .select('*')
            .eq('faculty_id', profileData.id);
          if (projData) base.projects = projData.map((p: any) => ({ ...p, title: p.title || "", description: p.description || "", role: p.role || "", year: p.year || "", url: p.url || "" }));
        } catch (e) {
          console.warn("Projects table missing or fetch failed:", e);
        }

        // ── CV Pre-fill: merge Gemini-extracted data if it exists ──────────
        const prefillRaw = sessionStorage.getItem("cv_prefill");
        if (prefillRaw) setCvPrefilled(true);
        if (prefillRaw) {
          try {
            const prefill = JSON.parse(prefillRaw);
            // Merge: extracted value takes priority over empty Supabase value
            if (prefill.name) base.name = prefill.name;
            if (prefill.designation) base.designation = prefill.designation;
            if (prefill.department) base.department = prefill.department;
            if (prefill.experience) base.experience = prefill.experience;
            if (prefill.email) base.email = prefill.email;
            if (prefill.phone) base.phone = prefill.phone;
            if (prefill.about) base.about = prefill.about;
            if (prefill.keywords?.length) base.keywords = prefill.keywords;
            if (prefill.education?.length) base.education = prefill.education;
            if (prefill.publications?.length) base.publications = prefill.publications.map((p: any) => ({
              title: p.title || "",
              journal: p.venue || "",
              type: p.type || "journal",
              year: p.year || "",
              doi: p.doi || "",
              index_tag: p.index_tag || "",
              award: p.award || "",
            }));
            if (prefill.awards?.length) base.awards = prefill.awards.map((a: any) => ({
              title: a.title || "",
              organization: a.body || "",
              year: a.year || "",
            }));
            if (prefill.projects?.length) base.projects = prefill.projects.map((p: any) => ({
              title: p.title || "",
              description: p.description || "",
              role: p.role || "",
              year: p.year || "",
              url: p.url || ""
            }));
            if (prefill.memberships?.length) base.memberships = prefill.memberships;
            if (prefill.certifications?.length) base.certifications = prefill.certifications.map((c: any) => ({
              title: c.name || "",
              organization: c.org || "",
              year: c.year || "",
            }));
            if (prefill.invited_talks?.length) base.invited_talks = prefill.invited_talks;
            if (prefill.social_links) {
              base.social_links = {
                linkedin: prefill.social_links.linkedin || base.social_links.linkedin,
                google_scholar: prefill.social_links.google_scholar || base.social_links.google_scholar,
                researchgate: prefill.social_links.researchgate || base.social_links.researchgate,
                twitter: prefill.social_links.twitter || base.social_links.twitter,
                website: prefill.social_links.website || base.social_links.website,
              };
            }
          } catch (e) {
            console.warn("Failed to parse CV prefill data:", e);
          } finally {
            // Clear so it only applies once
            sessionStorage.removeItem("cv_prefill");
          }
        }

        setFormData(base);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const handleUpdateCompletion = async (newProfileData: any) => {
    const score = calculateCompletion(newProfileData);
    if (newProfileData.completion !== score) {
      await supabase
        .from('faculty_profiles')
        .update({ completion: score })
        .eq('id', newProfileData.id);
    }
  };

  const handleSaveTab = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      if (activeTab === "Basic Info") {
        const { error } = await supabase
          .from('faculty_profiles')
          .update({
            name: formData.name,
            designation: formData.designation,
            department: formData.department,
            experience: formData.experience,
            email: formData.email,
            phone: formData.phone,
            social_links: formData.social_links
          })
          .eq('id', profile.id);
        if (error) throw error;
      } else if (activeTab === "About") {
        const { error } = await supabase
          .from('faculty_profiles')
          .update({ about: formData.about })
          .eq('id', profile.id);
        if (error) throw error;
      } else if (activeTab === "Keywords") {
        const { error } = await supabase
          .from('faculty_profiles')
          .update({
            keywords: formData.keywords,
            note_to_admin: formData.note_to_admin
          })
          .eq('id', profile.id);
        if (error) throw error;
      } else if (activeTab === "Memberships") {
        const { error } = await supabase
          .from('faculty_profiles')
          .update({ memberships: formData.memberships })
          .eq('id', profile.id);
        if (error) throw error;
      } else if (activeTab === "Additional Info") {
        const { error } = await supabase
          .from('faculty_profiles')
          .update({ custom_sections: formData.custom_sections })
          .eq('id', profile.id);
        if (error) throw error;
      } else if (["Education", "Publications", "Projects", "Awards", "Certifications"].includes(activeTab)) {
        const table = activeTab.toLowerCase();
        // Delete and Insert
        const { error: delError } = await supabase
          .from(table)
          .delete()
          .eq('faculty_id', profile.id);
        if (delError) throw delError;

        if (formData[table].length > 0) {
          const rowsToInsert = formData[table].map((item: any) => {
            if (table === 'education') {
              return { degree: item.degree, institution: item.institution, year: item.year, faculty_id: profile.id };
            } else if (table === 'publications') {
              return { title: item.title, venue: item.journal || item.venue, type: item.type, year: item.year, doi: item.doi, index_tag: item.index_tag, award: item.award, faculty_id: profile.id };
            } else if (table === 'projects') {
              return { title: item.title, description: item.description, role: item.role, year: item.year, faculty_id: profile.id };
            } else if (table === 'awards') {
              return { title: item.title, body: item.organization || item.body, year: item.year, faculty_id: profile.id };
            } else if (table === 'certifications') {
              return { name: item.title || item.name, org: item.organization || item.org, year: item.year, faculty_id: profile.id };
            }
            const { id, created_at, ...rest } = item;
            return { ...rest, faculty_id: profile.id };
          });
          const { error: insError } = await supabase
            .from(table)
            .insert(rowsToInsert);
          if (insError) throw insError;
        }
      }

      // Recalculate completion
      await handleUpdateCompletion({ ...profile, ...formData });
      showToast("Saved!", "success");
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("Error saving. Try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      // 1. Update Profile Status to approved so it goes to public directory immediately
      // and profile_status to pending_review so admin gets notified
      let { error: profileError } = await supabase
        .from('faculty_profiles')
        .update({ status: 'approved', profile_status: 'pending_review' })
        .eq('id', profile.id);
        
      if (profileError) {
        // Fallback in case profile_status column doesn't exist
        const { error: fallbackError } = await supabase
          .from('faculty_profiles')
          .update({ status: 'approved' })
          .eq('id', profile.id);
        if (fallbackError) throw fallbackError;
      }

      // 2. Insert Audit Log
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          faculty_id: profile.id,
          actor: 'faculty',
          action: 'submit',
          detail: 'Profile published directly to directory; Admin notified for review'
        });
      if (auditError) {
         console.warn("Audit log error", auditError);
      }

      showToast("Profile published to directory!", "success");
      setProfile({ ...profile, status: 'approved', profile_status: 'pending_review' });
    } catch (err: any) {
      console.error("Submit error:", err);
      showToast("Error publishing. Try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('faculty_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, avatar_url: publicUrl });
      showToast("Avatar updated!", "success");
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast("Error uploading avatar.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: Tab[] = ["Basic Info", "About", "Education", "Publications", "Projects", "Awards", "Certifications", "Keywords", "Memberships", "Additional Info"];

  if (loading) {
    return (
      <FacultyLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-headline text-[15px] font-bold text-primary">Loading Profile...</p>
          </div>
        </div>
      </FacultyLayout>
    );
  }

  if (!profile && !loading) {
    return (
      <FacultyLayout>
        <div className="mx-6 mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-12 text-center">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="font-headline text-2xl font-extrabold text-primary">Profile Record Missing</h2>
          <p className="mt-3 max-w-md font-body text-[15px] text-secondary">
            We couldn't find a faculty profile record for your account. Please contact an administrator to set up your profile.
          </p>
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout>
      {toast && (
        <div className="fixed top-20 right-8 z-[60] animate-in fade-in slide-in-from-right-8">
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <p className="font-headline text-[14px] font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full overflow-hidden">

        {/* CV PRE-FILL BANNER */}
        {cvPrefilled && (
          <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-container/20 px-4 py-3.5 shrink-0">
            <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-headline text-[13px] font-bold text-primary">
                Profile pre-filled from your CV
              </p>
              <p className="font-body text-[12px] text-secondary mt-0.5">
                Review each tab and click <span className="font-bold">Save Draft</span> to persist the changes to your profile.
              </p>
            </div>
            <button
              onClick={() => setCvPrefilled(false)}
              className="text-outline hover:text-primary transition-colors shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="px-6 py-6 border-b border-outline-variant/30 shrink-0 bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-[22px] font-bold tracking-tight text-primary">
                Profile Editor
              </h1>
              <p className="mt-1 font-body text-[14px] text-secondary">
                Keep your academic and professional data up to date.
              </p>
            </div>

            <div className="relative group">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high transition-transform hover:scale-105">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary/40">
                    <Camera size={24} />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Camera size={12} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* EDITOR LAYOUT */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* SIDEBAR TABS */}
          <div className="w-full md:w-[220px] shrink-0 border-r border-outline-variant/30 flex flex-row md:flex-col overflow-x-auto bg-surface-container-lowest">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-between px-5 py-4 font-headline text-[13px] transition-colors whitespace-nowrap ${activeTab === tab
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

              {/* ADMIN FEEDBACK / REVISION INFO */}
              {profile.status === 'revision' && formData.admin_feedback && (
                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <RotateCcw size={18} />
                    <span className="font-headline text-[14px] font-bold">Revision Requested by Admin</span>
                  </div>
                  <p className="font-body text-[13px] text-amber-900 leading-relaxed bg-white/50 p-3 rounded-lg border border-amber-200/50">
                    {formData.admin_feedback}
                  </p>
                </div>
              )}

              {activeTab === "Basic Info" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Basic Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      >
                        <option>Electronics & CS</option>
                        <option>Information Technology</option>
                        <option>Computer Engineering</option>
                        <option>Mechanical</option>
                        <option>Humanities & Sciences</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Experience (Years)</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-8 border-t border-outline-variant/30 pt-6">
                    <h3 className="font-headline text-[16px] font-bold text-primary mb-4">Social & Professional Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          value={formData.social_links.linkedin}
                          onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                          className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Google Scholar URL</label>
                        <input
                          type="url"
                          placeholder="https://scholar.google.com/citations?user=..."
                          value={formData.social_links.google_scholar}
                          onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, google_scholar: e.target.value } })}
                          className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">ResearchGate URL</label>
                        <input
                          type="url"
                          placeholder="https://researchgate.net/profile/..."
                          value={formData.social_links.researchgate}
                          onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, researchgate: e.target.value } })}
                          className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Twitter / X URL</label>
                        <input
                          type="url"
                          placeholder="https://twitter.com/username"
                          value={formData.social_links.twitter}
                          onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                          className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Personal Website</label>
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={formData.social_links.website}
                          onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, website: e.target.value } })}
                          className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "About" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">About / Overview</h2>
                  <div>
                    <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Professional Biography</label>
                    <textarea
                      rows={8}
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      placeholder="Describe your academic journey, research interests, and professional achievements..."
                      className="w-full resize-y border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === "Education" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Education Timeline</h2>
                  <div className="flex flex-col gap-4">
                    {formData.education.map((item: any, idx: number) => (
                      <div key={idx} className="border border-outline-variant rounded-lg bg-surface p-4 relative group">
                        <button
                          onClick={() => {
                            const newEdu = [...formData.education];
                            newEdu.splice(idx, 1);
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="absolute top-4 right-4 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Degree</label>
                            <input type="text" value={item.degree} onChange={(e) => {
                              const newEdu = [...formData.education];
                              newEdu[idx].degree = e.target.value;
                              setFormData({ ...formData, education: newEdu });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Institution</label>
                            <input type="text" value={item.institution} onChange={(e) => {
                              const newEdu = [...formData.education];
                              newEdu[idx].institution = e.target.value;
                              setFormData({ ...formData, education: newEdu });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Year</label>
                            <input type="text" value={item.year} onChange={(e) => {
                              const newEdu = [...formData.education];
                              newEdu[idx].year = e.target.value;
                              setFormData({ ...formData, education: newEdu });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Field of Study</label>
                            <input type="text" value={item.field} onChange={(e) => {
                              const newEdu = [...formData.education];
                              newEdu[idx].field = e.target.value;
                              setFormData({ ...formData, education: newEdu });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, education: [...formData.education, { degree: '', institution: '', year: '', field: '' }] })}
                      className="flex items-center justify-center gap-2 border border-dashed border-primary text-primary bg-primary-container/20 rounded-lg py-3 font-headline text-[13px] font-bold hover:bg-primary-container/40 transition-colors"
                    >
                      <Plus size={16} /> Add Education Entry
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Projects" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Research & Development Projects</h2>
                  <div className="flex flex-col gap-4">
                    {formData.projects.map((item: any, idx: number) => (
                      <div key={idx} className="border border-outline-variant rounded-lg bg-surface p-4 relative group">
                        <button
                          onClick={() => {
                            const newList = [...formData.projects];
                            newList.splice(idx, 1);
                            setFormData({ ...formData, projects: newList });
                          }}
                          className="absolute top-4 right-4 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="mt-2 grid grid-cols-1 gap-3">
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Project Title</label>
                            <input type="text" value={item.title} onChange={(e) => {
                              const newList = [...formData.projects];
                              newList[idx].title = e.target.value;
                              setFormData({ ...formData, projects: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Description / Outcome</label>
                            <textarea rows={2} value={item.description} onChange={(e) => {
                              const newList = [...formData.projects];
                              newList[idx].description = e.target.value;
                              setFormData({ ...formData, projects: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Role (PI/Co-PI/Lead)</label>
                              <input type="text" value={item.role} onChange={(e) => {
                                const newList = [...formData.projects];
                                newList[idx].role = e.target.value;
                                setFormData({ ...formData, projects: newList });
                              }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                              <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Project URL / Website</label>
                              <input type="url" placeholder="https://..." value={item.url || ''} onChange={(e) => {
                                const newList = [...formData.projects];
                                newList[idx].url = e.target.value;
                                setFormData({ ...formData, projects: newList });
                              }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, projects: [...formData.projects, { title: '', description: '', role: '', year: '', url: '' }] })}
                      className="flex items-center justify-center gap-2 border border-dashed border-primary text-primary bg-primary-container/20 rounded-lg py-3 font-headline text-[13px] font-bold hover:bg-primary-container/40 transition-colors"
                    >
                      <Plus size={16} /> Add Project
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Publications" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Academic Publications</h2>
                  <div className="flex flex-col gap-4">
                    {formData.publications.map((item: any, idx: number) => (
                      <div key={idx} className="border border-outline-variant rounded-lg bg-surface p-4 relative group">
                        <button
                          onClick={() => {
                            const newList = [...formData.publications];
                            newList.splice(idx, 1);
                            setFormData({ ...formData, publications: newList });
                          }}
                          className="absolute top-4 right-4 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="mt-2">
                          <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Publication Title</label>
                          <input type="text" value={item.title} onChange={(e) => {
                            const newList = [...formData.publications];
                            newList[idx].title = e.target.value;
                            setFormData({ ...formData, publications: newList });
                          }} className="w-full mb-3 border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Journal / Conference</label>
                            <input type="text" value={item.journal} onChange={(e) => {
                              const newList = [...formData.publications];
                              newList[idx].journal = e.target.value;
                              setFormData({ ...formData, publications: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Year</label>
                            <input type="text" value={item.year} onChange={(e) => {
                              const newList = [...formData.publications];
                              newList[idx].year = e.target.value;
                              setFormData({ ...formData, publications: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, publications: [...formData.publications, { title: '', journal: '', year: '', type: 'journal' }] })}
                      className="flex items-center justify-center gap-2 border border-dashed border-primary text-primary bg-primary-container/20 rounded-lg py-3 font-headline text-[13px] font-bold hover:bg-primary-container/40 transition-colors"
                    >
                      <Plus size={16} /> Add Publication
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Awards" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Awards & Recognition</h2>
                  <div className="flex flex-col gap-4">
                    {formData.awards.map((item: any, idx: number) => (
                      <div key={idx} className="border border-outline-variant rounded-lg bg-surface p-4 relative group">
                        <button
                          onClick={() => {
                            const newList = [...formData.awards];
                            newList.splice(idx, 1);
                            setFormData({ ...formData, awards: newList });
                          }}
                          className="absolute top-4 right-4 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Award / Honor Title</label>
                            <input type="text" value={item.title} onChange={(e) => {
                              const newList = [...formData.awards];
                              newList[idx].title = e.target.value;
                              setFormData({ ...formData, awards: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Conferred By</label>
                            <input type="text" value={item.organization} onChange={(e) => {
                              const newList = [...formData.awards];
                              newList[idx].organization = e.target.value;
                              setFormData({ ...formData, awards: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Year</label>
                            <input type="text" value={item.year} onChange={(e) => {
                              const newList = [...formData.awards];
                              newList[idx].year = e.target.value;
                              setFormData({ ...formData, awards: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, awards: [...formData.awards, { title: '', organization: '', year: '' }] })}
                      className="flex items-center justify-center gap-2 border border-dashed border-primary text-primary bg-primary-container/20 rounded-lg py-3 font-headline text-[13px] font-bold hover:bg-primary-container/40 transition-colors"
                    >
                      <Plus size={16} /> Add Award
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Certifications" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Certifications & FDPs</h2>
                  <div className="flex flex-col gap-4">
                    {formData.certifications.map((item: any, idx: number) => (
                      <div key={idx} className="border border-outline-variant rounded-lg bg-surface p-4 relative group">
                        <button
                          onClick={() => {
                            const newList = [...formData.certifications];
                            newList.splice(idx, 1);
                            setFormData({ ...formData, certifications: newList });
                          }}
                          className="absolute top-4 right-4 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Certification / Course Title</label>
                            <input type="text" value={item.title} onChange={(e) => {
                              const newList = [...formData.certifications];
                              newList[idx].title = e.target.value;
                              setFormData({ ...formData, certifications: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Issuing Organization / Platform</label>
                            <input type="text" value={item.organization} onChange={(e) => {
                              const newList = [...formData.certifications];
                              newList[idx].organization = e.target.value;
                              setFormData({ ...formData, certifications: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                          <div>
                            <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Year</label>
                            <input type="text" value={item.year} onChange={(e) => {
                              const newList = [...formData.certifications];
                              newList[idx].year = e.target.value;
                              setFormData({ ...formData, certifications: newList });
                            }} className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, certifications: [...formData.certifications, { title: '', organization: '', year: '' }] })}
                      className="flex items-center justify-center gap-2 border border-dashed border-primary text-primary bg-primary-container/20 rounded-lg py-3 font-headline text-[13px] font-bold hover:bg-primary-container/40 transition-colors"
                    >
                      <Plus size={16} /> Add Certification
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Keywords" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Research Keywords</h2>
                  <div>
                    <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.keywords.join(", ")}
                      onChange={(e) => {
                        const words = e.target.value.split(",").map(w => w.trim());
                        setFormData({ ...formData, keywords: words });
                      }}
                      placeholder="e.g. Machine Learning, Cloud Security, VLSI Design"
                      className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all font-body shadow-sm"
                    />
                    <p className="mt-2 text-[12px] text-outline italic">Separate keywords with commas to help student find your profile during research queries.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.keywords.map((word: string, i: number) => word && (
                      <span key={i} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-[12px] font-bold text-primary border border-primary/20">
                        {word}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-outline-variant/30 pt-6">
                    <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Note to Admin (Internal)</label>
                    <textarea
                      rows={3}
                      value={formData.note_to_admin}
                      onChange={(e) => setFormData({ ...formData, note_to_admin: e.target.value })}
                      placeholder="Explain any major changes or special requests to the administrator..."
                      className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {activeTab === "Memberships" && (
                <div className="flex flex-col gap-5 pb-12">
                  <h2 className="font-headline text-[18px] font-bold text-primary mb-2">Professional Memberships</h2>
                  <div>
                    <label className="font-label text-[11px] font-bold uppercase tracking-wider text-outline block mb-1.5">Societies / Organizations (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.memberships.join(", ")}
                      onChange={(e) => {
                        const words = e.target.value.split(",").map(w => w.trim());
                        setFormData({ ...formData, memberships: words });
                      }}
                      placeholder="e.g. IEEE Senior Member, ACM Professional, CSI"
                      className="w-full border border-outline-variant rounded-lg bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 transition-all font-body shadow-sm"
                    />
                    <p className="mt-2 text-[12px] text-outline italic">List professional bodies you are associated with (e.g. IEEE, ISTE, ACM).</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.memberships.map((word: string, i: number) => word && (
                      <span key={i} className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 font-body text-[12px] font-bold text-blue-700 border border-blue-200">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Additional Info" && (
                <div className="flex flex-col gap-5 pb-12">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="font-headline text-[18px] font-bold text-primary">Additional Information</h2>
                      <p className="font-body text-[13px] text-secondary">Custom sections extracted from your CV or added manually.</p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, custom_sections: [...formData.custom_sections, { title: "", content: "" }] })}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 font-headline text-[13px] font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      <Plus size={16} /> Add Section
                    </button>
                  </div>
                  
                  {formData.custom_sections.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 text-center">
                      <p className="font-body text-[13px] text-outline italic">No additional sections added.</p>
                    </div>
                  ) : (
                    formData.custom_sections.map((section: any, idx: number) => (
                      <div key={idx} className="relative rounded-xl border border-outline-variant/50 bg-surface p-5 shadow-sm">
                        <button
                          onClick={() => {
                            const updated = [...formData.custom_sections];
                            updated.splice(idx, 1);
                            setFormData({ ...formData, custom_sections: updated });
                          }}
                          className="absolute right-4 top-4 text-outline transition-colors hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="mb-4">
                          <label className="mb-1 block font-label text-[11px] font-bold uppercase tracking-wider text-outline">Section Title</label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => {
                              const updated = [...formData.custom_sections];
                              updated[idx].title = e.target.value;
                              setFormData({ ...formData, custom_sections: updated });
                            }}
                            placeholder="e.g. Languages, Patents, Volunteer Work"
                            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="mb-1 block font-label text-[11px] font-bold uppercase tracking-wider text-outline">Content</label>
                          <textarea
                            value={section.content}
                            onChange={(e) => {
                              const updated = [...formData.custom_sections];
                              updated[idx].content = e.target.value;
                              setFormData({ ...formData, custom_sections: updated });
                            }}
                            placeholder="Describe the details here..."
                            className="w-full min-h-[100px] rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body text-[13px] text-primary focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* STICKY FOOTER TOOLBAR */}
        <div className="shrink-0 border-t border-outline-variant/30 bg-surface px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status indicator removed per user request */}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveTab}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-surface-container font-headline text-[13px] font-medium text-secondary hover:text-primary transition-colors hover:bg-surface-container-high active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              onClick={handleSubmitForReview}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary font-headline text-[13px] font-bold text-on-primary transition-opacity hover:opacity-90 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Send size={16} /> {isSaving ? "Publishing..." : "Publish to Directory"}
            </button>
          </div>
        </div>
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
