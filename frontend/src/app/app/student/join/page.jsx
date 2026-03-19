"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  ClipboardPaste,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { BackButton } from "@/components/ui/elements";

const CreateRosterPage = () => {
  const router = useRouter();
  const { api } = useMetadata();

  const [courseIdInput, setCourseIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!courseIdInput.trim()) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // POST to: courses/<course_id>/roster/ with no body
      await api.post(`courses/${courseIdInput.trim()}/rosters/`);

      setStatus({
        type: "success",
        message:
          "Successfully enrolled! You are now on the official course roster.",
      });
    } catch (err) {
      console.log(err?.response);
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "Invalid Course ID or you are already enrolled in this course.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="bg-surface rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Maroon Header Accent */}
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary mb-6">
            <UserPlus size={32} />
          </div>

          <h1 className="text-h2 uppercase mb-2 tracking-tighter">
            Join a Course
          </h1>
          <p className="text-caption mb-8">
            Paste the <strong>Course UUID</strong> provided by your instructor
            below to register.
          </p>

          <form onSubmit={handleEnroll} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                <Fingerprint size={20} />
              </div>
              <input
                type="text"
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full pl-10 pr-4 py-4 bg-background border border-border rounded-md font-mono text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
                value={courseIdInput}
                onChange={(e) => setCourseIdInput(e.target.value)}
                required
              />
            </div>

            {/* Status Feedback */}
            {status.message && (
              <div
                className={`p-4 rounded-md flex items-start text-left gap-3 border animate-in fade-in zoom-in duration-300 ${
                  status.type === "error"
                    ? "bg-red-50 border-red-200 text-error"
                    : "bg-green-50 border-green-200 text-green-800"
                }`}
              >
                {status.type === "error" ? (
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                )}
                <p className="text-xs font-bold leading-tight">
                  {status.message}
                </p>
              </div>
            )}

            <div className="pt-2">
              {status.type === "success" ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/app/student/${courseIdInput.trim()}`)
                  }
                  className="cursor-pointer w-full py-4 bg-accent text-white font-black rounded shadow-subtle hover:brightness-110 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 group"
                >
                  Enter Course Portal{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !courseIdInput}
                  className={`cursor-pointer w-full py-4 bg-primary text-white font-black rounded shadow-lg hover:bg-accent transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ClipboardPaste size={16} />
                  )}
                  {loading ? "Registering..." : "Add to My Roster"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <p className="text-center mt-8 text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold opacity-50">
        ULM Warhawk Management System &bull; Enrollment Module
      </p>
    </div>
  );
};

export default CreateRosterPage;
