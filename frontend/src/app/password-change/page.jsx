"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Lock,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

function getProfilePath(role) {
  if (role === "FA") return "/dashboard/faculty";
  if (role === "ST") return "/dashboard/student";
  return "/dashboard/faculty";
}

export default function ChangePasswordPage() {
  const { api } = useMetadata();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useMetadata();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (data.new_password !== data.re_new_password) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(`auth/users/set_password/`, data);
      if (response.status === 204) {
        setSuccess(true);
        setTimeout(
          () =>
            router.push(
              `${getProfilePath(user?.role?.toUpperCase())}/settings`,
            ),
          2000,
        );
      }
    } catch (err) {
      setError(err.response?.data?.current_password?.[0] || "Update failed.");
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
            {success ? "Success" : "Update Password"}
          </h2>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
            {success ? "Credentials Synced" : "Security Protocol v4.1"}
          </p>
        </div>

        {success ? (
          <div className="text-center py-10 animate-in zoom-in-95">
            <CheckCircle2 size={64} className="mx-auto text-secondary" />
            <p className="mt-4 text-xs font-bold text-text-muted uppercase">
              Redirecting to Profile...
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleChangePassword}>
            {/* Inputs */}
            <div className="space-y-4">
              <InputField
                label="Current Password"
                name="current_password"
                icon={<KeyRound size={18} />}
              />
              <div className="h-px bg-border/50" />
              <InputField
                label="New Password"
                name="new_password"
                icon={<Lock size={18} />}
              />
              <InputField
                label="Confirm New Password"
                name="re_new_password"
                icon={<Lock size={18} />}
              />
            </div>

            {error && (
              <p className="text-[10px] font-black text-error bg-error/5 p-3 rounded-lg text-center uppercase tracking-widest">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-secondary transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              Update Credentials
            </button>
          </form>
        )}

        <div className="pt-6 border-t border-border flex justify-center">
          <Link
            href={`${getProfilePath(user?.role?.toUpperCase())}/settings`}
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to{" "}
            {user?.role?.toUpperCase() === "FA"
              ? "Faculty"
              : user?.role?.toUpperCase() === "ST"
                ? "Student"
                : "Grading Assistant"}{" "}
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-border group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input
          name={name}
          type="password"
          required
          placeholder="••••••••"
          className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
        />
      </div>
    </div>
  );
}
