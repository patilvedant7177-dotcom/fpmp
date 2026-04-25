"use client";

import { useState, useEffect, useMemo } from "react";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import { 
  Mail, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Filter, 
  Archive, 
  Inbox, 
  Send, 
  Clock,
  MoreVertical,
  ChevronRight,
  Reply,
  AlertCircle,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  sentAt: string;
  read: boolean;
  type: "Direct" | "Broadcast" | "External";
}

type Tab = "All" | "Direct" | "Broadcast" | "External";

export default function FacultyMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [facultyList, setFacultyList] = useState<{id: string, name: string}[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ 
    recipientId: "admin", 
    subject: "", 
    body: "",
    publicEmail: "", // Used when replying to external
    isPublicReply: false
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase.from('faculty_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (!profile) return;

        const profileId = profile.id;
        
        // Fetch Messages
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .or(`to_faculty.eq.${profileId},to_faculty.is.null`)
          .order('sent_at', { ascending: false });

        // Fetch Faculty List (excluding self)
        const { data: facs } = await supabase
          .from('faculty_profiles')
          .select('id, name')
          .neq('id', profileId)
          .order('name');
        
        if (facs) setFacultyList(facs);

        if (msgs) {
          const readMsgs = JSON.parse(localStorage.getItem('fpmp_read_messages') || '[]');
          
          const mapped = msgs.filter(msg => {
            // Filter out messages sent BY the faculty to anyone (admin or other faculty)
            return !(msg.from_admin === false && msg.body?.includes('[FACULTY_SENT]'));
          }).map(msg => {
            let sender = msg.from_admin ? "FPMP Administration" : "System";
            let type: "Direct" | "Broadcast" | "External" = msg.to_faculty === null ? "Broadcast" : "Direct";
            let avatar = msg.from_admin ? "AD" : "SY";

            if (!msg.from_admin && msg.to_faculty) {
              const facMatch = msg.body?.match(/^\[FACULTY_SENT\] From: (.*)\n\n/);
              const extMatch = msg.body?.match(/^From: (.*)\n\n/);
              
              if (facMatch) {
                sender = facMatch[1];
                type = "Direct";
                avatar = sender.substring(0, 2).toUpperCase();
              } else if (extMatch) {
                type = "External";
                avatar = "EX";
                sender = extMatch[1];
                avatar = sender.substring(0, 2).toUpperCase();
              } else {
                sender = "External Inquiry";
              }
            }

            return {
              id: msg.id,
              sender,
              avatar,
              subject: msg.subject,
              snippet: (msg.body || "").replace(/^\[FACULTY_SENT\] From: (.*)\n\n/, "").replace(/^From: (.*)\n\n/, "").substring(0, 100) + "...",
              body: msg.body.replace(/^\[FACULTY_SENT\] From: (.*)\n\n/, "").replace(/^From: (.*)\n\n/, ""),
              date: new Date(msg.sent_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              sentAt: msg.sent_at,
              read: readMsgs.includes(msg.id),
              type
            };
          });
          setMessages(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleRead = (id: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
    setExpandedId(expandedId === id ? null : id);
    
    const readMsgs = JSON.parse(localStorage.getItem('fpmp_read_messages') || '[]');
    if (!readMsgs.includes(id)) {
      readMsgs.push(id);
      localStorage.setItem('fpmp_read_messages', JSON.stringify(readMsgs));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Remove this message from your inbox?")) return;

    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMessages(msgs => msgs.filter(m => m.id !== id));
      const readMsgs = JSON.parse(localStorage.getItem('fpmp_read_messages') || '[]');
      const filtered = readMsgs.filter((rid: string) => rid !== id);
      localStorage.setItem('fpmp_read_messages', JSON.stringify(filtered));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.subject || !composeData.body) return;
    
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('faculty_profiles').select('id, name, email').eq('user_id', user.id).maybeSingle();
      if (!profile) return;

      if (composeData.isPublicReply) {
        // Send email to public user
        await fetch("/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: composeData.publicEmail,
            toName: "Inquirer",
            fromName: profile.name,
            subject: composeData.subject,
            body: composeData.body,
            type: "contact", // Use contact type to send email
          }),
        });
        alert(`Reply sent to ${composeData.publicEmail}`);
      } else {
        // Internal message
        const targetId = composeData.recipientId === "admin" ? profile.id : composeData.recipientId;
        const isToAdmin = composeData.recipientId === "admin";

        const { error } = await supabase.from('messages').insert({
          from_admin: false,
          to_faculty: targetId,
          subject: composeData.subject,
          body: `[FACULTY_SENT] From: ${profile.name}\n\n${composeData.body}`,
        });

        if (!error) {
          alert(isToAdmin ? "Message sent to administration." : "Message sent to faculty member.");
        }
      }

      setIsComposeOpen(false);
      setComposeData({ recipientId: "admin", subject: "", body: "", publicEmail: "", isPublicReply: false });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleReply = (msg: Message) => {
    setComposeData({
      recipientId: "admin", // Default to admin for replies unless it's external or faculty
      subject: `Re: ${msg.subject.startsWith('Re: ') ? msg.subject.substring(4) : msg.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${msg.sender}\nDate: ${msg.date}\n\n${msg.body}`,
      publicEmail: "",
      isPublicReply: false
    });
    setIsComposeOpen(true);
  };

  const handlePublicReply = (msg: Message) => {
    // Extract email from original body if possible
    const emailMatch = msg.body.match(/Sender email: (.*)/);
    const email = emailMatch ? emailMatch[1] : "";

    setComposeData({
      recipientId: "external",
      subject: `Re: ${msg.subject}`,
      body: `\n\n--- Original Inquiry ---\n\n${msg.body}`,
      publicEmail: email,
      isPublicReply: true
    });
    setIsComposeOpen(true);
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch = 
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.body.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === "All" || m.type === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [messages, searchQuery, activeTab]);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <FacultyLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* HEADER SECTION */}
        <div className="px-8 pt-8 pb-6 bg-surface shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Inbox size={24} />
                </div>
                <h1 className="font-headline text-[28px] font-bold tracking-tight text-primary">
                  Communications
                </h1>
              </div>
              <p className="font-body text-[14px] text-on-surface-variant max-w-[500px]">
                Stay updated with administrative announcements, peer messages, and student inquiries.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setComposeData({ recipientId: "admin", subject: "", body: "", publicEmail: "", isPublicReply: false });
                  setIsComposeOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary font-headline text-[13px] font-bold text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={18} />
                Compose
              </button>

              <button 
                onClick={() => {
                  const allIds = messages.map(m => m.id);
                  const readMsgs = JSON.parse(localStorage.getItem('fpmp_read_messages') || '[]');
                  const newRead = Array.from(new Set([...readMsgs, ...allIds]));
                  localStorage.setItem('fpmp_read_messages', JSON.stringify(newRead));
                  setMessages(msgs => msgs.map(m => ({ ...m, read: true })));
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/50 bg-white font-headline text-[12px] font-bold text-outline hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm"
              >
                <CheckCircle2 size={16} />
                Mark all
              </button>
              
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-[200px] rounded-full border border-outline-variant bg-surface-container-low font-body text-[13px] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-2 mt-8 border-b border-outline-variant/30">
            {(["All", "Direct", "Broadcast", "External"] as Tab[]).map((tab) => {
              const count = tab === "All" ? messages.length : messages.filter(m => m.type === tab).length;
              const unread = tab === "All" ? unreadCount : messages.filter(m => m.type === tab && !m.read).length;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-3 font-headline text-[13px] font-bold transition-all hover:text-primary ${
                    activeTab === tab ? "text-primary" : "text-outline hover:bg-surface-container-low/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab}
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      activeTab === tab ? "bg-primary text-on-primary" : "bg-surface-container-high text-outline"
                    }`}>
                      {count}
                    </span>
                    {unread > 0 && (
                      <span className="absolute top-2 right-1 w-2 h-2 rounded-full bg-error" />
                    )}
                  </span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_4px_rgba(0,52,111,0.2)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-surface-container-low">
          <div className="max-w-4xl mx-auto flex flex-col gap-4 pb-20">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="font-label text-[12px] font-bold text-outline uppercase tracking-widest">Fetching your mailbox...</p>
              </div>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((msg, index) => {
                const isExpanded = expandedId === msg.id;

                return (
                  <div 
                    key={msg.id} 
                    className={`group relative flex flex-col rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 reveal`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Message Row */}
                    <div 
                      onClick={() => handleRead(msg.id)}
                      className={`flex items-start gap-4 p-5 cursor-pointer rounded-2xl transition-all ${
                        isExpanded 
                          ? "bg-white border-primary shadow-lg scale-[1.01] z-10" 
                          : !msg.read 
                            ? "bg-surface-container border-primary/20 hover:bg-white hover:border-primary/40" 
                            : "bg-surface border-transparent hover:bg-white hover:border-outline-variant hover:shadow-md"
                      }`}
                    >
                      {/* Status Indicator */}
                      <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${!msg.read ? 'bg-primary shadow-[0_0_8px_rgba(0,52,111,0.5)]' : 'bg-transparent'}`} />
                      
                      {/* Avatar */}
                      <div className={`h-11 w-11 rounded-xl shrink-0 flex items-center justify-center font-headline text-[14px] font-extrabold shadow-sm ${
                        msg.type === 'External' ? 'bg-tertiary-container text-on-tertiary-container' : 
                        msg.type === 'Broadcast' ? 'bg-secondary-container text-on-secondary-container' :
                        'bg-primary-container text-on-primary-container'
                      }`}>
                        {msg.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h3 className={`truncate font-headline text-[15px] ${!msg.read ? 'font-extrabold text-primary' : 'font-bold text-on-surface'}`}>
                            {msg.sender}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="font-label text-[11px] font-bold text-outline">
                              {msg.date}
                            </span>
                            <button 
                              onClick={(e) => handleDelete(e, msg.id)}
                              className="text-outline hover:text-error transition-colors p-1.5 hover:bg-error/10 rounded-lg opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className={`truncate font-body text-[14px] ${!msg.read ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                            {msg.subject}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            msg.type === 'External' ? 'bg-tertiary/10 text-tertiary' : 
                            msg.type === 'Broadcast' ? 'bg-secondary/10 text-secondary' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {msg.type}
                          </span>
                        </div>

                        {!isExpanded && (
                          <p className="truncate font-body text-[13px] text-on-surface-variant/80">
                            {msg.snippet}
                          </p>
                        )}
                      </div>

                      <ChevronRight size={18} className={`text-outline/40 transition-transform mt-2 ${isExpanded ? 'rotate-90 text-primary' : ''}`} />
                    </div>

                    {/* Content View */}
                    {isExpanded && (
                      <div className="px-14 pb-8 pt-2 bg-white rounded-b-2xl">
                        <div className="h-px w-full bg-outline-variant/20 mb-6" />
                        
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-on-surface">
                            {msg.body}
                          </p>
                        </div>
                        
                        <div className="mt-10 flex flex-wrap items-center gap-3">
                          {msg.type === "External" ? (
                            <button 
                              onClick={() => handlePublicReply(msg)}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-headline text-[14px] font-bold text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                              <Reply size={18} />
                              Reply via Portal
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleReply(msg)}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-headline text-[14px] font-bold text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                              <Reply size={18} />
                              Reply In-App
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleDelete(e, msg.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-highest px-6 py-2.5 font-headline text-[14px] font-bold text-on-surface hover:bg-error/10 hover:text-error transition-all"
                          >
                            <Trash2 size={18} />
                            Move to Trash
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* PREMIUM EMPTY STATE */
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary-container rounded-[32px] flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
                    <Mail size={42} className="text-on-primary -rotate-3" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-outline-variant/20">
                    <CheckCircle2 size={20} className="text-primary" />
                  </div>
                </div>
                
                <h2 className="font-headline text-[22px] font-bold text-on-surface mb-2">
                  {searchQuery ? "No matching messages" : "Your inbox is clear"}
                </h2>
                <p className="font-body text-[15px] text-on-surface-variant max-w-[340px] leading-relaxed">
                  {searchQuery 
                    ? `We couldn't find anything matching "${searchQuery}". Try a different term or clear the search.` 
                    : "When you receive administrative notices or peer messages, they'll appear here beautifully organized."}
                </p>
                
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-6 font-headline text-[13px] font-bold text-primary hover:underline"
                  >
                    Clear Search
                  </button>
                )}

                <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 text-left">
                    <ShieldCheck size={20} className="text-primary mb-2" />
                    <h4 className="font-headline text-[12px] font-bold text-on-surface">Verified Sender</h4>
                    <p className="font-body text-[10px] text-outline">All admin communications are verified.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 text-left">
                    <Clock size={20} className="text-primary mb-2" />
                    <h4 className="font-headline text-[12px] font-bold text-on-surface">Peer messaging</h4>
                    <p className="font-body text-[10px] text-outline">Communicate with other faculty directly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPOSE MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsComposeOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-outline-variant overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface">
              <h2 className="font-headline text-[20px] font-bold text-primary">
                {composeData.isPublicReply ? "Reply to Public Inquiry" : "Compose Message"}
              </h2>
              <button onClick={() => setIsComposeOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSend} className="p-8 space-y-6">
              {!composeData.isPublicReply && (
                <div>
                  <label className="block font-label text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Recipient</label>
                  <select 
                    value={composeData.recipientId}
                    onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low font-body text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  >
                    <option value="admin">FPMP Administration</option>
                    <optgroup label="Faculty Members">
                      {facultyList.map(fac => (
                        <option key={fac.id} value={fac.id}>{fac.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {composeData.isPublicReply && (
                <div>
                  <label className="block font-label text-[11px] font-bold uppercase tracking-widest text-outline mb-2">To (Public Email)</label>
                  <input 
                    type="text" 
                    readOnly
                    value={composeData.publicEmail}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest font-body text-[14px] text-outline outline-none cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block font-label text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Subject</label>
                <input 
                  type="text"
                  required
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="e.g. Query regarding profile approval"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low font-body text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div>
                <label className="block font-label text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Message</label>
                <textarea 
                  required
                  rows={composeData.isPublicReply ? 6 : 8}
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder={composeData.isPublicReply ? "Write your reply to the inquirer..." : "Write your message..."}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low font-body text-[14px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-headline text-[14px] font-bold text-outline hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary font-headline text-[14px] font-bold text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {sending ? "Sending..." : (
                    <>
                      <Send size={18} />
                      {composeData.isPublicReply ? "Send Email" : "Send Message"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
}
