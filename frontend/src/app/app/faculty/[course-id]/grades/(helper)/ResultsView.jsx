"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  CornerDownRight,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Hash,
  FileCode,
  Download,
  Trophy,
  MessageSquare,
  User,
  Calendar,
  Pencil,
} from "lucide-react";
import { CodeReport } from "@/components/ui/sections";
import { GradingModal } from "@/components/graders/sections";

export default function ResultsView({
  results = [],
  submission = null,
  studentDetail = null,
  attemptNumber = "Final",
  assignmentId = null,
  children = null,
}) {
  const [openGradingModal, setOpenGradingModal] = useState(false);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {openGradingModal && (
        <GradingModal
          submission={submission}
          assignmentId={assignmentId}
          onClose={() => setOpenGradingModal(false)}
        />
      )}
      {/* --- GLANCEABLE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Left Side: Identity & Core Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">
              {studentDetail?.full_name || "Student Result"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
            <span className="flex items-center gap-1">
              <Hash size={12} className="text-secondary" /> {attemptNumber}{" "}
              Attempt
            </span>
            <span className="flex items-center gap-1">
              <User size={12} /> {studentDetail?.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />{" "}
              {new Date(submission?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Right Side: Action Buttons (Locked together) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setOpenGradingModal(true)}
            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded shadow-lg hover:brightness-110 active:scale-[0.98] transition-all group font-black uppercase tracking-widest text-xs"
          >
            <Trophy size={14} /> Grade
          </button>
          <div className="flex items-center gap-2">{children}</div>
        </div>
      </div>

      <CodeReport results={results} submission={submission} />
    </div>
  );
}
