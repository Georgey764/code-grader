"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, Loader2, Send, CheckCircle } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const email = new FormData(e.currentTarget).get("email");

    try {
      const response = await fetch(`${baseUrl}auth/users/reset_password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      console.log(response);
      if (response.ok) setIsSent(true);
      else setError("Account not found. Please verify your email.");
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-sm space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
            {isSent ? "Email Sent" : "Reset Password"}
          </h2>
          <p className="text-xs font-medium text-text-muted leading-relaxed px-4">
            {isSent
              ? "Check your inbox for a secure link to update your credentials."
              : "Enter your university email and we'll send you a recovery link."}
          </p>
        </div>

        {!isSent ? (
          <form className="space-y-6" onSubmit={handleResetRequest}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
                University Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-border"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="warhawk@ulm.edu"
                  className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-error bg-error/5 p-3 rounded-lg text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              Send Reset Link
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-6">
            <div className="flex justify-center">
              <CheckCircle size={48} className="text-secondary" />
            </div>
            <button
              onClick={() => setIsSent(false)}
              className="text-xs font-bold text-primary hover:underline decoration-2 underline-offset-4"
            >
              Didn't get it? Try again
            </button>
          </div>
        )}

        <div className="pt-6 border-t border-border flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
