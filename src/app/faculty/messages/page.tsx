"use client";

import { useState } from "react";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import { Mail, ShieldCheck, Plus, CheckCircle2 } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  avatar: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  read: boolean;
  type: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    sender: "FPMP Administration",
    avatar: "AD",
    subject: "Action Required: Update Profile Before 31st March",
    snippet: "This is a reminder that all faculty profiles must be updated and submitted...",
    body: "Dear Faculty Member,\n\nThis is a reminder that all faculty profiles must be updated and submitted for review before 31st March 2026.\n\nPlease log in to the Faculty Portal and ensure your profile is complete.\n\nRegards,\nFPMP Admin",
    date: "10:30 AM",
    read: false,
    type: "Broadcast",
  },
  {
    id: 2,
    sender: "FPMP Administration",
    avatar: "AD",
    subject: "Profile Review — Action Required",
    snippet: "Please update your FDP sections from 2024–2025 as soon as possible so we can finalize...",
    body: "Dear Dr. Makdey,\n\nPlease update your FDP sections from 2024–2025 as soon as possible so we can finalize approval of your current profile draft.\n\nRegards,\nFPMP Administration",
    date: "Yesterday",
    read: false,
    type: "Direct",
  },
  {
    id: 3,
    sender: "FPMP Administration",
    avatar: "AD",
    subject: "Profile Approved & Published",
    snippet: "Your recent profile submission has been approved and published to the public directory...",
    body: "Dear Dr. Makdey,\n\nYour recent profile submission has been approved and published to the public directory. Students can now view your updated publication logs.\n\nThank you.",
    date: "Mar 25",
    read: true,
    type: "System",
  },
  {
    id: 4,
    sender: "Student Enquiry Interface",
    avatar: "SE",
    subject: "Enquiry: Seeking guidance for final year project",
    snippet: "Respected Professor, I am a third-year EXTC student looking for project guidance in VLSI...",
    body: "Respected Professor,\n\nI am a third-year EXTC student looking for project guidance in VLSI integration. Would you have some time next week during office hours to discuss potential topics?\n\nSincerely,\nRahul Nair",
    date: "Mar 12",
    read: true,
    type: "External",
  }
];

export default function FacultyMessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleRead = (id: number) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
    setExpandedId(expandedId === id ? null : id);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <FacultyLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* PAGE HEADER */}
        <div className="px-6 py-6 border-b border-outline-variant/30 shrink-0 bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-headline text-[22px] font-bold tracking-tight text-primary">
                Message Inbox
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-primary text-on-primary font-headline text-[12px] shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="mt-1 font-body text-[14px] text-secondary">
                Administrative notices and student portal inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* FEED AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-surface-container-lowest">
          <div className="max-w-[800px] flex flex-col mx-auto">
            
            <div className="rounded-xl border border-outline-variant/50 bg-white shadow-sm overflow-hidden flex flex-col">
              
              {messages.map(msg => {
                const isExpanded = expandedId === msg.id;

                return (
                  <div key={msg.id} className={`flex flex-col border-b border-outline-variant/30 last:border-0 ${!msg.read ? 'bg-orange-50/20' : 'bg-white'}`}>
                    
                    <div 
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 cursor-pointer hover:bg-surface-container/20 transition-colors ${!msg.read ? 'border-l-[3px] border-l-primary px-[13px]' : 'border-l-[3px] border-l-transparent'}`}
                      onClick={() => handleRead(msg.id)}
                    >
                      {/* Avatar */}
                      <div className={`h-[40px] w-[40px] rounded-full shrink-0 flex items-center justify-center font-headline text-[13px] font-bold shadow-sm ${msg.type === 'External' ? 'bg-blue-100 text-blue-900' : 'bg-surface-container-high text-primary'}`}>
                        {msg.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                          <h3 className={`truncate font-headline text-[14px] ${!msg.read ? 'font-bold text-primary' : 'font-semibold text-secondary'}`}>
                            {msg.sender}
                          </h3>
                          <span className={`shrink-0 font-body text-[11px] ${!msg.read ? 'font-bold text-primary' : 'text-outline'}`}>
                            {msg.date}
                          </span>
                        </div>
                        <h4 className={`truncate font-body text-[13px] mb-1 ${!msg.read ? 'font-bold text-primary' : 'font-medium text-secondary'}`}>
                          {msg.subject}
                        </h4>
                        <p className={`truncate font-body text-[13px] ${!msg.read ? 'text-secondary/80' : 'text-outline/70'}`}>
                          {msg.snippet}
                        </p>
                      </div>
                    </div>

                    {/* EXPANDED CONTENT VIEW */}
                    {isExpanded && (
                      <div className="p-5 bg-surface-container/10 border-t border-outline-variant/20 mx-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-primary font-label text-[10px] font-bold uppercase tracking-wider">
                            {msg.type} Dispatch
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap font-body text-[14px] leading-relaxed text-secondary border-l-2 border-outline-variant/50 pl-4 py-1">
                          {msg.body}
                        </p>
                        
                        {msg.type === "External" && (
                          <div className="mt-6 flex items-center gap-3">
                            <button className="rounded-lg bg-primary text-on-primary px-4 py-2 font-headline text-[13px] font-bold shadow-sm hover:opacity-90 transition-opacity">
                              Reply via Email
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )
              })}

            </div>

          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
