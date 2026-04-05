"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Send,
  X,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";

interface FacultyOption {
  id: string;
  name: string;
}

const mockFaculty: FacultyOption[] = [
  { id: "1", name: "Dr. Swapnali Makdey" },
  { id: "2", name: "Prof. Rahul Kulkarni" },
  { id: "3", name: "Dr. Anita Patil" },
  { id: "4", name: "Dr. Ninad More" },
  { id: "5", name: "Prof. Vivek Shah" },
];

interface SentMessage {
  id: number;
  type: "Broadcast" | "Direct";
  subject: string;
  to: string;
  sentAt: string;
  sent: number;
  read: number;
  body: string;
}

const mockSentMessages: SentMessage[] = [
  {
    id: 1,
    type: "Broadcast",
    subject: "Action Required: Update Profile Before 31st March",
    to: "All 48 faculty",
    sentAt: "Apr 2, 2026 · 10:30 AM",
    sent: 48,
    read: 31,
    body: "Dear Faculty Member,\n\nThis is a reminder that all faculty profiles must be updated and submitted for review before 31st March 2026.\n\nPlease log in to the Faculty Portal and ensure your profile is complete.\n\nRegards,\nFPMP Admin",
  },
  {
    id: 2,
    type: "Direct",
    subject: "Profile Review — Action Required",
    to: "Dr. Swapnali Makdey",
    sentAt: "Apr 2, 2026 · 9:15 AM",
    sent: 1,
    read: 1,
    body: "Please update your FDP sections from 2024–2025 as soon as possible so we can finalize approval.",
  },
  {
    id: 3,
    type: "Direct",
    subject: "Revision Requested — Please Update Publications",
    to: "Dr. Anita Patil",
    sentAt: "Mar 30, 2026 · 3:45 PM",
    sent: 1,
    read: 0,
    body: "Please add the DOIs for your Scopus indexed publications so they reflect correctly on the public portal layout.",
  },
  {
    id: 4,
    type: "Broadcast",
    subject: "Welcome to FPMP — Getting Started Guide",
    to: "All 48 faculty",
    sentAt: "Mar 15, 2026 · 11:00 AM",
    sent: 48,
    read: 45,
    body: "Welcome to the new Faculty Profile Management Portal. Attached is the general PDF guide for navigating the platform interfaces.",
  },
  {
    id: 5,
    type: "Direct",
    subject: "Please Upload Your Updated CV",
    to: "Prof. Vivek Shah, Prof. Rohit Naik",
    sentAt: "Mar 12, 2026 · 2:00 PM",
    sent: 2,
    read: 1,
    body: "Dear Faculty,\n\nPlease upload your latest CV to the FPMP portal. Our AI system will extract your profile sections automatically.",
  },
  {
    id: 6,
    type: "Broadcast",
    subject: "New Feature: AI CV Extraction Now Available",
    to: "All 48 faculty",
    sentAt: "Mar 1, 2026 · 9:00 AM",
    sent: 48,
    read: 48,
    body: "The AI CV processing module is now live and functioning on all faculty endpoints. Please test it and report any anomalies to administrators.",
  },
];

type MessageType = "Direct Message" | "Broadcast to All" | "Broadcast by Department";
type SentFilter = "All" | "Direct" | "Broadcast";

export default function AdminMessagingPage() {
  // Compose State
  const [messageType, setMessageType] = useState<MessageType>("Direct Message");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyOption[]>([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedTemplate, setSelectedTemplate] = useState("No template");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({ subject: false, body: false });

  // Sent Messages State
  const [sentFilter, setSentFilter] = useState<SentFilter>("All");
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);

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

  const handleSend = () => {
    const hasSubjectError = subject.trim() === "";
    const hasBodyError = body.trim() === "";

    if (hasSubjectError || hasBodyError) {
      setErrors({ subject: hasSubjectError, body: hasBodyError });
      return;
    }

    setErrors({ subject: false, body: false });
    
    let targetMsg = "";
    if (messageType === "Direct Message") {
      targetMsg = `${selectedFaculty.length} faculty`;
    } else if (messageType === "Broadcast by Department") {
      targetMsg = `faculty in ${selectedDept}`;
    } else {
      targetMsg = "all 48 faculty";
    }

    alert(`Message sent successfully to ${targetMsg}.`);
    
    // Reset
    setSubject("");
    setBody("");
    setSelectedFaculty([]);
    setSelectedTemplate("No template");
    setScheduleDate("");
    setScheduleTime("");
  };

  const filteredSentMessages = mockSentMessages.filter((m) => {
    if (sentFilter === "All") return true;
    return m.type === sentFilter;
  });

  const getPreviewInfo = () => {
    if (messageType === "Direct Message") {
      if (selectedFaculty.length === 0) return "Sending to: No faculty selected";
      return `Sending to: ${selectedFaculty.map((f) => f.name).join(", ")}`;
    }
    if (messageType === "Broadcast by Department") {
      return `Sending to: ${selectedDept} (Filtered Faculty)`;
    }
    return "Sending to: All 48 faculty members";
  };

  return (
    <AdminLayout>
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
                {(["Direct Message", "Broadcast to All", "Broadcast by Department"] as MessageType[]).map((type) => (
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
            {messageType === "Direct Message" && (
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
                    {mockFaculty.map((f) => (
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

            {/* Field 2b: Department */}
            {messageType === "Broadcast by Department" && (
              <div>
                <label className="mb-1.5 block font-label text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-body text-[13px] text-slate-900 shadow-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                >
                  <option>All Departments</option>
                  <option>Electronics & CS</option>
                  <option>Computer Engineering</option>
                  <option>Electronics</option>
                  <option>Mechanical</option>
                  <option>Civil</option>
                  <option>Information Tech</option>
                </select>
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
                <button className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-headline text-[13px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 md:flex-none">
                  Save Draft
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 rounded-lg bg-primary px-5 py-2 font-headline text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95 md:flex-none"
                >
                  {scheduleDate || scheduleTime ? "Schedule Send" : "Send Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SENT MESSAGES */}
        <div className="w-full shrink-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:w-[380px] md:flex">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-[15px] font-bold text-slate-900">
              Sent Messages
            </h2>
            <div className="flex gap-1">
              {(["All", "Direct", "Broadcast"] as SentFilter[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSentFilter(tab)}
                  className={`rounded-full px-2.5 py-1 font-headline text-[11px] font-semibold transition-colors ${
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
            {filteredSentMessages.map((msg) => {
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
                        {msg.type === "Broadcast" ? (
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
                        {msg.sentAt}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-0.5">
                      <span className="truncate font-body text-[12px] text-slate-500">
                        To: {msg.to}
                      </span>
                      <div className="flex shrink-0 items-center gap-1 font-body text-[11px] text-slate-400">
                        <span>
                          {msg.sent} sent · {msg.read} read
                        </span>
                        {msg.read === msg.sent ? (
                          <CheckCircle2 size={12} className="text-green-600" />
                        ) : (
                          <Clock size={12} className="text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50 p-3">
                      <p className="whitespace-pre-wrap font-body text-[13px] leading-[1.7] text-slate-600">
                        {msg.body}
                      </p>
                      <div className="mt-3 text-right">
                        <button className="rounded-md border border-slate-300 px-3 py-1 font-headline text-[12px] font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-900">
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredSentMessages.length === 0 && (
              <div className="py-8 text-center font-body text-sm text-slate-500">
                No sent messages in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
