"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Send,
  X,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FacultyOption {
  id: string;
  name: string;
  email: string;
}

interface DBMessage {
  id: string;
  from_admin: boolean;
  to_faculty: string | null;
  subject: string;
  body: string;
  sent_at: string;
  faculty_profiles?: {
    name: string;
    email: string;
  } | null;
}

type MessageType = "Direct" | "Broadcast";
type SentFilter = "All" | "Direct" | "Broadcast";

function MessagingContent() {
  const searchParams = useSearchParams();
  const [allFaculty, setAllFaculty] = useState<FacultyOption[]>([]);
  const [sentMessages, setSentMessages] = useState<DBMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Compose State
  const [messageType, setMessageType] = useState<MessageType>("Direct");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("No template");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({ subject: false, body: false });

  // Sent Messages State
  const [sentFilter, setSentFilter] = useState<SentFilter | "Inbox" | "Drafts">("All");
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, faculty_profiles(name, email)")
      .order("sent_at", { ascending: false });
    if (data) {
      setSentMessages(data as any);
    }
  };

  const fetchFaculty = async () => {
    const { data } = await supabase.from("faculty_profiles").select("id, name, email");
    if (data) {
      setAllFaculty(data);
    }
  };

  useEffect(() => {
    Promise.all([fetchMessages(), fetchFaculty()]).then(() => {
      setIsLoading(false);
    });
    // Load drafts from localStorage
    const savedDrafts = localStorage.getItem("admin_message_drafts");
    if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
  }, []);

  // Handle pre-selected faculty from query params
  useEffect(() => {
    if (allFaculty.length > 0) {
      const selectIds = searchParams.get('select')?.split(',');
      if (selectIds && selectIds.length > 0) {
        const selected = allFaculty.filter(f => selectIds.includes(f.id));
        if (selected.length > 0) {
          setSelectedFaculty(selected);
          setMessageType("Direct");
        }
      }
    }
  }, [allFaculty, searchParams]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    setErrors({ subject: false, body: false });

    if (val === "Profile Deadline Reminder") {
      setSubject("Action Required: Update Your Profile Before 31st March 2026");
      setBody(
        "Dear Faculty Member,\n\nThis is a reminder that all faculty profiles must be updated and submitted for review before 31st March 2026.\n\nPlease log in to the Faculty Portal and ensure your profile is complete, including publications, certifications, and research keywords.\n\nFor assistance, please contact the admin.\n\nRegards,\nFPMP Admin"
      );
    } else if (val === "CV Upload Request") {
      setSubject("Please Upload Your Updated CV");
      setBody(
        "Dear Faculty Member,\n\nWe request you to upload your latest CV to the FPMP portal. Our AI system will automatically extract and update your profile sections.\n\nThis helps maintain accurate and up-to-date faculty records.\n\nRegards,\nFPMP Admin"
      );
    } else if (val === "Approval Notification") {
      setSubject("Profile Approved and Published");
      setBody(
        "Dear Faculty Member,\n\nYour profile updates have been successfully approved and are now visible on the Public Directory.\n\nRegards,\nFPMP Admin"
      );
    } else if (val === "Welcome Message") {
      setSubject("Welcome to the Faculty Profile Management Portal");
      setBody(
        "Dear Faculty Member,\n\nWelcome back to the portal! Please set up your credentials and initiate your initial profile build.\n\nRegards,\nFPMP Admin"
      );
    } else {
      setSubject("");
      setBody("");
    }
  };

  const toggleFacultySelection = (faculty: FacultyOption) => {
    if (selectedFaculty.some((f) => f.id === faculty.id)) {
      setSelectedFaculty(selectedFaculty.filter((f) => f.id !== faculty.id));
    } else {
      setSelectedFaculty([...selectedFaculty, faculty]);
    }
  };

  const handleSaveDraft = () => {
    const newDraft = {
      id: `draft-${Date.now()}`,
      subject,
      body,
      type: messageType,
      faculty: selectedFaculty,
      sent_at: new Date().toISOString(),
      is_draft: true
    };
    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem("admin_message_drafts", JSON.stringify(updatedDrafts));
    setToastMsg("Draft saved!");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleUseDraft = (draft: any) => {
    setSubject(draft.subject);
    setBody(draft.body);
    setMessageType(draft.type);
    setSelectedFaculty(draft.faculty || []);
    setSentFilter("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("admin_message_drafts", JSON.stringify(updated));
  };

  const handleSend = async () => {
    const hasSubjectError = subject.trim() === "";
    const hasBodyError = body.trim() === "";

    if (hasSubjectError || hasBodyError) {
      setErrors({ subject: hasSubjectError, body: hasBodyError });
      return;
    }
    if (messageType === "Direct" && selectedFaculty.length === 0) {
      alert("Please select at least one faculty member.");
      return;
    }

    setErrors({ subject: false, body: false });
    setIsSending(true);

    const auditLog = async (detail: string) => {
      await supabase.from("audit_log").insert({ actor: "admin", action: "message", detail });
    };

    try {
      if (messageType === "Broadcast") {
        await supabase.from("messages").insert({
          from_admin: true,
          to_faculty: null,
          subject,
          body
        });

        const emails = allFaculty.map((f) => f.email).filter(Boolean);
        for (const email of emails) {
          await fetch("/api/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: email,
              toName: "Faculty Member",
              fromName: "FPMP Admin",
              subject,
              body,
              type: "admin"
            })
          });
        }
        await auditLog(subject);
      } else {
        for (const faculty of selectedFaculty) {
          await supabase.from("messages").insert({
            from_admin: true,
            to_faculty: faculty.id,
            subject,
            body
          });
          if (faculty.email) {
            await fetch("/api/send-message", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: faculty.email,
                toName: faculty.name,
                fromName: "FPMP Admin",
                subject,
                body,
                type: "admin"
              })
            });
          }
        }
        await auditLog(subject);
      }

      setToastMsg("Message sent!");
      setTimeout(() => setToastMsg(""), 3000);
      
      // Reset
      setSubject("");
      setBody("");
      setSelectedFaculty([]);
      setSelectedTemplate("No template");
      setScheduleDate("");
      setScheduleTime("");
      
      await fetchMessages();
    } catch (e) {
      console.error(e);
      alert("Error sending message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAdminReply = (msg: DBMessage) => {
    setMessageType("Direct");
    const faculty = allFaculty.find(f => f.id === msg.to_faculty);
    if (faculty) setSelectedFaculty([faculty]);
    setSubject(`Re: ${msg.subject}`);
    setBody(`\n\n--- Original Message from Faculty ---\n\n${msg.body}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSentMessages = sentMessages.filter((m) => {
    if (sentFilter === "Drafts") return false; // Handled separately
    if (sentFilter === "Inbox") {
      return !m.from_admin;
    }
    
    // Default: only show sent messages (from_admin: true)
    if (!m.from_admin) return false;

    const mType = m.to_faculty === null ? "Broadcast" : "Direct";
    if (sentFilter === "All") return true;
    return mType === sentFilter;
  });

  const getPreviewInfo = () => {
    if (messageType === "Direct") {
      if (selectedFaculty.length === 0) return "Sending to: No faculty selected";
      return `Sending to: ${selectedFaculty.map((f) => f.name).join(", ")}`;
    }
    return `Sending to: All ${allFaculty.length} faculty members`;
  };

  return (
    <AdminLayout>
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[9999] rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-md border border-emerald-200 flex items-center gap-2 font-body text-sm animate-in fade-in">
          <CheckCircle2 size={18} />
          {toastMsg}
        </div>
      )}
      {/* PAGE HEADER */}
      <div className="px-6 pb-4 pt-6">
        <h1 className="font-headline text-[22px] font-bold tracking-tight text-slate-900">
          Messaging Centre
        </h1>
        <p className="mt-1 font-body text-[14px] text-slate-500">
          Send direct messages or broadcast announcements to faculty
        </p>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="flex flex-col gap-5 px-6 pb-6 md:flex-row">
        {/* LEFT COLUMN: COMPOSE MESSAGE */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Send size={16} className="text-primary" />
            <h2 className="font-headline text-[15px] font-bold text-slate-900">
              Compose Message
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Field 1: Message Type */}
            <div>
              <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Message Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["Direct", "Broadcast"] as MessageType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMessageType(type)}
                    className={`rounded-full px-3 py-1.5 font-headline text-[12px] font-semibold transition-colors ${
                      messageType === type
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: To (Direct Message) */}
            {messageType === "Direct" && (
              <div className="relative">
                <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  To
                </label>
                <div
                  className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  {selectedFaculty.map((f) => (
                    <span
                      key={f.id}
                      className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary-container/40 px-2 py-0.5 font-label text-[11px] font-bold text-primary"
                    >
                      {f.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFacultySelection(f);
                        }}
                        className="transition-colors hover:text-orange-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={
                      selectedFaculty.length === 0 ? "Select faculty..." : ""
                    }
                    className="flex-1 bg-transparent font-body text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full z-10 mt-1 max-h-[200px] w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {allFaculty.map((f) => (
                      <div
                        key={f.id}
                        className="cursor-pointer px-3 py-2 font-body text-[13px] text-slate-900 transition-colors hover:bg-slate-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          toggleFacultySelection(f);
                        }}
                      >
                        {f.name}
                        {selectedFaculty.some((selected) => selected.id === f.id) && (
                          <CheckCircle2
                            size={14}
                            className="float-right text-primary"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Field 2b: Broadcast All */}
            {messageType === "Broadcast" && (
              <div>
                <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  To
                </label>
                <div className="flex h-[42px] cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 font-body text-[13px] text-slate-500">
                  All Faculty ({allFaculty.length})
                </div>
              </div>
            )}

            {/* Field 3: Template */}
            <div>
              <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Template (optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
              >
                <option>No template</option>
                <option>Profile Deadline Reminder</option>
                <option>CV Upload Request</option>
                <option>Approval Notification</option>
                <option>Welcome Message</option>
              </select>
            </div>

            {/* Field 4: Subject */}
            <div>
              <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Subject
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Profile Deadline Reminder"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setErrors({ ...errors, subject: false });
                  }}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:ring-[3px] focus:ring-primary/10 ${
                    errors.subject
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-primary"
                  }`}
                />
                {errors.subject && (
                  <span className="absolute -bottom-5 right-0 font-body text-[11px] text-red-500">
                    Required
                  </span>
                )}
              </div>
            </div>

            {/* Field 5: Message */}
            <div>
              <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Message
              </label>
              <textarea
                rows={6}
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setBody(e.target.value);
                    setErrors({ ...errors, body: false });
                  }
                }}
                className={`w-full resize-y rounded-lg border bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:ring-[3px] focus:ring-primary/10 ${
                  errors.body
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-300 focus:border-primary"
                }`}
              />
              <div className="mt-1 flex justify-between">
                {errors.body ? (
                  <span className="font-body text-[11px] text-red-500">
                    Required
                  </span>
                ) : (
                  <span />
                )}
                <span className="font-body text-[11px] text-slate-400">
                  {body.length} / 1000
                </span>
              </div>
            </div>

            {/* Field 6: Schedule */}
            <div>
              <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Schedule Send (optional)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                />
              </div>
              <p className="mt-1 font-body text-[11px] text-slate-400">
                Leave blank to send immediately
              </p>
            </div>

            {/* SEND BUTTON ROW */}
            <div className="mt-2 flex flex-col items-start gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
              <span className="font-body text-[12px] text-slate-500 break-words max-w-[280px]">
                {getPreviewInfo()}
              </span>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <button 
                  onClick={handleSaveDraft}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-headline text-[13px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 md:flex-none"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex-1 rounded-lg bg-primary px-5 py-2 font-headline text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending..." : (scheduleDate || scheduleTime ? "Schedule Send" : "Send Now")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SENT MESSAGES */}
        <div className="w-full shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:w-[380px] md:flex">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-[15px] font-bold text-slate-900">
              Message History
            </h2>
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {(["All", "Direct", "Broadcast", "Inbox", "Drafts"] as (SentFilter | "Inbox" | "Drafts")[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSentFilter(tab)}
                  className={`rounded-full px-2.5 py-1 font-headline text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    sentFilter === tab
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto pr-1" style={{ maxHeight: "600px" }}>
            {sentFilter === "Drafts" ? (
              drafts.map((draft) => (
                <div key={draft.id} className="group flex flex-col border-b border-slate-200 last:border-0 p-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-slate-600">
                      Draft
                    </span>
                    <button onClick={() => handleDeleteDraft(draft.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                  <h3 className="font-headline text-[13px] font-bold text-slate-900 truncate mb-1">{draft.subject || "(No Subject)"}</h3>
                  <p className="font-body text-[12px] text-slate-500 line-clamp-2 mb-3">{draft.body || "(No content)"}</p>
                  <button 
                    onClick={() => handleUseDraft(draft)}
                    className="w-full rounded-md border border-primary/20 bg-primary/5 py-1.5 font-headline text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors"
                  >
                    Edit Draft
                  </button>
                </div>
              ))
            ) : (
              filteredSentMessages.map((msg) => {
                const isExpanded = expandedMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className="group flex flex-col border-b border-slate-200 last:border-0"
                  >
                    <div
                      className="cursor-pointer py-3 transition-colors hover:bg-slate-50 px-1"
                      onClick={() =>
                        setExpandedMessageId(isExpanded ? null : msg.id)
                      }
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {!msg.from_admin ? (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-emerald-900">
                              Faculty Inbound
                            </span>
                          ) : msg.to_faculty === null ? (
                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-blue-900">
                              Broadcast
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 font-label text-[10px] font-bold tracking-wider text-purple-900">
                              Direct
                            </span>
                          )}
                          <span className="truncate font-headline text-[13px] font-medium text-slate-900">
                            {msg.subject}
                          </span>
                        </div>
                        <span className="shrink-0 font-body text-[11px] text-slate-400">
                          {new Date(msg.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-0.5">
                        <span className="truncate font-body text-[12px] text-slate-500">
                          {msg.from_admin ? "To: " : "From: "}{msg.to_faculty === null ? "All Faculty" : (msg.faculty_profiles?.name || "Unknown Faculty")}
                        </span>
                        <div className="flex shrink-0 items-center gap-1 font-body text-[11px] text-slate-400">
                          <span>{msg.from_admin ? "Delivered" : "Received"}</span>
                          <CheckCircle2 size={12} className="text-green-600" />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50 p-3">
                        <p className="whitespace-pre-wrap font-body text-[13px] leading-[1.7] text-slate-600">
                          {msg.body}
                        </p>
                        <div className="mt-3 text-right">
                          {!msg.from_admin && (
                            <button 
                              onClick={() => handleAdminReply(msg)}
                              className="rounded-md bg-primary px-4 py-1 font-headline text-[12px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                            >
                              Reply to Faculty
                            </button>
                          )}
                          {msg.from_admin && (
                            <button className="rounded-md border border-slate-300 px-3 py-1 font-headline text-[12px] font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-900">
                              Resend
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {((sentFilter === "Drafts" && drafts.length === 0) || (sentFilter !== "Drafts" && filteredSentMessages.length === 0)) && (
              <div className="py-8 text-center font-body text-sm text-slate-500">
                No messages in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminMessagingPage() {
  return (
    <Suspense fallback={<div>Loading messaging...</div>}>
      <MessagingContent />
    </Suspense>
  );
}
