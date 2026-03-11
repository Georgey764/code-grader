"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
  ArrowLeft,
} from "lucide-react";

export default function AddToRosterPage() {
  const params = useParams();
  const router = useRouter();
  const { api } = useMetadata();

  // Extract course-id from URL params
  const courseId = params["course-id"];

  const [cwid, setCwid] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!cwid.trim()) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // API call: POST courses/<course-id>/?cwid={cwid}
      await api.post(`courses/${courseId}/rosters/?cwid=${cwid}`);

      setStatus({
        type: "success",
        message: `Student with CWID ${cwid} has been added to the roster successfully.`,
      });
      setCwid(""); // Clear input on success
    } catch (err) {
      console.log(err.response);
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "Could not add student. Verify the CWID is correct and the student has a profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      <div className="bg-surface rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Maroon Accent Bar */}
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <UserPlus size={32} />
          </div>

          <h1 className="text-h2 uppercase mb-2 tracking-tighter">
            Enroll Student
          </h1>
          <p className="text-caption mb-8 max-w-sm mx-auto">
            Enter the student&apos;s 8-digit **Campus Wide ID** to manually add
            them to this course roster.
          </p>

          <form onSubmit={handleAddStudent} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors">
                <Hash size={20} />
              </div>
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. 30123456"
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-md font-mono text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
                value={cwid}
                onChange={(e) => setCwid(e.target.value.replace(/\D/g, ""))} // Only allow digits
                required
              />
            </div>

            {/* Status Feedback */}
            {status.message && (
              <div
                className={`p-4 rounded-md flex items-start text-left gap-3 border animate-in zoom-in duration-300 ${
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
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                    {status.type === "error"
                      ? "System Alert"
                      : "Enrollment Success"}
                  </p>
                  <p className="text-xs font-medium leading-tight">
                    {status.message}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || cwid.length < 1}
              className={`w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3
                ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"}
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search size={16} /> Locate & Add Student
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center mt-8 text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold opacity-50">
        ULM Administrative Portal &bull; Roster Management
      </p>
    </div>
  );
}
