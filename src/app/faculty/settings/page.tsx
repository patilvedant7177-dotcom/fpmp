"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import FacultyLayout from "@/components/faculty/FacultyLayout";
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred while updating password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FacultyLayout>
      <div className="px-6 pt-6 pb-12">
        <div className="max-w-2xl">
          <h1 className="font-headline text-[24px] font-extrabold tracking-tight text-primary">
            Account Settings
          </h1>
          <p className="mt-1 font-body text-[14px] text-secondary">
            Manage your account security and preferences.
          </p>

          <div className="mt-8 space-y-6">
            {/* Change Password Card */}
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="font-headline text-[18px] font-bold text-primary">Change Password</h2>
                  <p className="font-body text-[13px] text-secondary">Update your password to keep your account secure.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-outline font-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-2.5 text-[14px] text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-body"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-outline font-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-outline-variant/50 bg-surface px-4 py-2.5 text-[14px] text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-body"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-[13px] text-red-600">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-[13px] text-green-700">
                    <CheckCircle2 size={16} />
                    <span>{success}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shine-button flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-headline text-[14px] font-bold text-on-primary shadow-sm transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Notice Card */}
            <div className="rounded-2xl border border-outline-variant/30 bg-secondary-container/5 p-6 border-l-4 border-l-blue-500">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-headline text-[15px] font-bold text-primary">Security Recommendation</h3>
                  <p className="mt-1 font-body text-[13px] text-secondary leading-relaxed">
                    If you were provided with a temporary password by an administrator, we strongly recommend changing it immediately. A strong password should be at least 8 characters long and include a mix of letters, numbers, and symbols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
