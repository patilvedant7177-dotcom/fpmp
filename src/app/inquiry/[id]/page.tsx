import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  MessageSquare, 
  Clock, 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InquiryStatusPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  // Fetch the main inquiry
  const { data: mainMsg } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .single();

  if (!mainMsg) {
    notFound();
  }

  // Fetch replies (linked by THREAD_ID in the body)
  const { data: replies } = await supabase
    .from('messages')
    .select('*')
    .like('body', `%[THREAD_ID: ${id}]%`)
    .order('sent_at', { ascending: true });

  const conversation = [
    {
      id: mainMsg.id,
      sender: mainMsg.body.match(/^From: (.*)\n\n/)?.[1] || "You",
      body: mainMsg.body.replace(/^From: (.*)\n\n/, "").replace(/Sender email: (.*)/, "").trim(),
      date: new Date(mainMsg.sent_at).toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFaculty: false
    },
    ...(replies || []).map(r => {
      const isFaculty = r.body.includes('[FACULTY_SENT]');
      return {
        id: r.id,
        sender: isFaculty ? "Faculty Member" : "System",
        body: r.body.replace(/\[FACULTY_SENT\] To: (.*)\n\n/, "").replace(/\[THREAD_ID: (.*)\]/, "").trim(),
        date: new Date(r.sent_at).toLocaleString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isFaculty
      };
    })
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest">
      <PublicNavbar />
      
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-32">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link 
              href="/directory" 
              className="group mb-4 inline-flex items-center gap-2 text-sm font-bold text-outline transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Directory
            </Link>
            <h1 className="font-headline text-[32px] font-black tracking-tight text-primary">
              Inquiry Status
            </h1>
            <p className="font-body text-[15px] text-on-surface-variant">
              Track the progress of your message to the faculty.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label text-[11px] font-black uppercase tracking-widest text-primary">
                Live Tracking
              </span>
            </div>
            <span className="font-mono text-[11px] text-outline bg-surface px-2 py-1 rounded border border-outline-variant/30">
              ID: {id.substring(0, 8)}...
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-8">
          {/* TIMELINE CONNECTOR */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/30 via-outline-variant/20 to-transparent" />

          {conversation.map((msg, idx) => (
            <div 
              key={msg.id} 
              className={`relative flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Avatar Circle */}
              <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm border ${
                msg.isFaculty 
                  ? "bg-primary text-on-primary border-primary" 
                  : "bg-white text-primary border-outline-variant/50"
              }`}>
                {msg.isFaculty ? <ShieldCheck size={24} /> : <User size={24} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <h3 className={`font-headline text-[15px] font-bold ${msg.isFaculty ? "text-primary" : "text-on-surface"}`}>
                      {msg.sender}
                    </h3>
                    <div className="flex items-center gap-2 text-[12px] text-outline">
                      <Clock size={12} />
                      {msg.date}
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="rounded-full bg-surface-container-high px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-outline border border-outline-variant/30">
                      Original Message
                    </span>
                  )}
                </div>

                <div className={`rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md ${
                  msg.isFaculty 
                    ? "bg-white border-primary/20 ring-4 ring-primary/5" 
                    : "bg-surface-container-low border-outline-variant/20"
                }`}>
                  <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-on-surface-variant">
                    {msg.body}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {conversation.length === 1 && (
            <div className="ml-18 mt-4 rounded-2xl bg-surface border border-dashed border-outline-variant/50 p-10 text-center animate-in fade-in slide-in-from-top-2">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
                <Clock className="text-outline animate-pulse" size={24} />
              </div>
              <h4 className="font-headline text-[16px] font-bold text-on-surface">Waiting for Faculty Reply</h4>
              <p className="font-body text-[13px] text-on-surface-variant max-w-[280px] mx-auto mt-1">
                The faculty has been notified. You can refresh this page anytime to check for updates.
              </p>
            </div>
          )}
        </div>

        <div className="mt-20 rounded-3xl bg-primary p-8 text-on-primary shadow-xl shadow-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="font-headline text-[20px] font-bold mb-1">Stay Notified</h3>
              <p className="font-body text-[14px] opacity-90 max-w-[400px]">
                Bookmark this URL or save the Tracking ID. We recommend checking back in 24-48 hours for an official response.
              </p>
            </div>
            <div className="md:ml-auto">
              <p className="text-[12px] font-bold opacity-70">Official Record</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-outline">
          <AlertCircle size={14} />
          <p className="font-label text-[11px] uppercase tracking-widest font-bold">
            Secure Institutional Communication Channel
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
