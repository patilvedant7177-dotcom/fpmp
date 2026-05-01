"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import DownloadReceipt from "@/components/inquiry/DownloadReceipt";

type ContactFormProps = {
  facultyName: string;
  facultyEmail: string;
};

export default function ContactForm({ facultyName, facultyEmail }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facultyEmail || !facultyName) {
      setStatus("error");
      setErrorMessage("Recipient information is missing. Cannot send message.");
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    const bodyText = [
      formData.message,
      "",
      `Sender email: ${formData.email}`,
    ].join("\n");

    try {
      const payload = {
        to: facultyEmail,
        toName: facultyName,
        fromName: formData.name,
        subject: formData.subject,
        body: bodyText,
        senderEmail: formData.email,
        type: "contact",
      };

      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }

      setLastSubmission({
        trackId: data.id,
        facultyName,
        ...formData
      });
      setStatus("success");
      setErrorMessage(data.id); // Store the tracking ID
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-6 shadow-md mt-4">
      <h3 className="mb-5 font-headline text-[16px] font-bold text-primary">
        Send a message to {facultyName}
      </h3>
      <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
        {!lastSubmission ? (
          <>
            <input
              type="text"
              placeholder="Name"
              required
              disabled={submitting || !facultyEmail}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
            <input
              type="email"
              placeholder="Email"
              required
              disabled={submitting || !facultyEmail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
            <input
              type="text"
              placeholder="Subject"
              required
              disabled={submitting || !facultyEmail}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
            <textarea
              placeholder="Message"
              rows={4}
              required
              disabled={submitting || !facultyEmail}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-3 font-body text-[13px] text-primary shadow-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
            {status === "error" && errorMessage && (
              <p className="text-center font-body text-[13px] text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
            {!facultyEmail && (
              <p className="text-center font-body text-[13px] text-red-600" role="alert">
                This faculty member has no contact email registered.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !facultyEmail}
              className="mt-2 w-full rounded-lg bg-primary py-3.5 font-headline text-[14px] font-bold text-on-primary shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </>
        ) : (
          <div className="rounded-xl bg-emerald-50 p-6 border border-emerald-100 text-center animate-in zoom-in-95">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <Download size={24} />
            </div>
            <p className="font-headline text-[16px] font-bold text-emerald-800 mb-2">
              Message Sent Successfully!
            </p>
            <p className="font-body text-[13px] text-emerald-700 mb-4">
              Your message has been delivered. Please download your receipt below for your records.
            </p>
            
            <div className="bg-white p-3 rounded-xl border border-emerald-200 mb-4">
              <p className="font-label text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-1">Tracking ID</p>
              <div className="font-mono text-[14px] font-bold text-emerald-900 break-all">
                {lastSubmission.trackId}
              </div>
            </div>

            <DownloadReceipt 
              trackId={lastSubmission.trackId}
              facultyName={lastSubmission.facultyName}
              senderName={lastSubmission.name}
              senderEmail={lastSubmission.email}
              subject={lastSubmission.subject}
              message={lastSubmission.message}
            />

            <button 
              onClick={() => {
                setLastSubmission(null);
                setStatus("idle");
              }}
              className="mt-6 text-[12px] font-bold text-emerald-600 hover:underline"
            >
              Send another message
            </button>
          </div>
        )}
        <p className="mt-2 text-center font-label text-[10px] uppercase tracking-wide text-outline">
          Your email will not be shared with anyone.
        </p>
      </form>
    </div>
  );
}
