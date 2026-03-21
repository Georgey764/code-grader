"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function ResetPasswordConfirmPage() {
  const { uid, token } = useParams();
  const router = useRouter();

  const [passwords, setPasswords] = useState({
    new_password: "",
    re_new_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Client-side validation
    if (passwords.new_password !== passwords.re_new_password) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}auth/users/reset_password_confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, token, ...passwords }),
        },
      );

      if (response.ok) {
        router.push("/login?reset=success");
      } else {
        setError("This reset link has expired or is invalid.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-sm space-y-8 animate-in fade-in duration-500">
        {/* Header - Maroon Theme */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/5 text-primary rounded-xl">
              <ShieldCheck size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">
            Finalize Reset
          </h2>
          <p className="text-xs font-medium text-text-muted leading-relaxed px-4">
            Security Protocol: Please establish a new set of credentials for
            your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
              New Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-border group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                onChange={(e) =>
                  setPasswords({ ...passwords, new_password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
              Confirm Credentials
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-border group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    re_new_password: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-error bg-error/5 p-3 rounded-lg animate-in zoom-in-95">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-secondary active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ShieldCheck size={16} />
            )}
            {isLoading ? "Synchronizing..." : "Update Password"}
          </button>
        </form>

        {/* Cancel Action */}
        <div className="pt-6 border-t border-border flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Cancel and Return
          </Link>
        </div>
      </div>
    </div>
  );
}
