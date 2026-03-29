"use client";

import React, { useState } from "react";
import {
  Hash,
  Trophy,
  User,
  Calendar,
  AlertTriangle,
  GitCompareArrows,
} from "lucide-react";
import { CodeReport } from "@/components/ui/sections";
import { GradingModal } from "@/components/graders/sections";
import AIDetectionBadge from "@/components/graders/elements/AIDetectionBadge";
import PlagiarismDiffModal from "@/components/graders/elements/PlagiarismDiffModal";

export default function ResultsView({
  results = [],
  submission = null,
  studentDetail = null,
  attemptNumber = "Final",
  assignmentId = null,
  children = null,
}) {
  const [openGradingModal, setOpenGradingModal] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffOtherId, setDiffOtherId] = useState(null);

  const plagiarismMatches = submission?.plagiarism_matches || [];
  const topPlagiarism = plagiarismMatches[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {openGradingModal && (
        <GradingModal
          submission={submission}
          assignmentId={assignmentId}
          onClose={() => setOpenGradingModal(false)}
        />
      )}
      <PlagiarismDiffModal
        open={diffOpen}
        onClose={() => {
          setDiffOpen(false);
          setDiffOtherId(null);
        }}
        submissionId={submission?.id}
        otherSubmissionId={diffOtherId}
      />
      {/* --- GLANCEABLE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Left Side: Identity & Core Stats */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">
              {studentDetail?.full_name || "Student Result"}
            </h2>
            {submission?.ai_prediction != null && submission?.ai_prediction !== "" && (
              <AIDetectionBadge prediction={submission.ai_prediction} />
            )}
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

      {submission?.plagiarism_alert && topPlagiarism && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-amber-700"
              size={20}
              aria-hidden
            />
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-amber-950">
                Student-to-student similarity flagged
              </p>
              <p className="mt-1 text-[11px] font-bold text-amber-900/90">
                Highest match: {topPlagiarism.similarity_percent}% structural
                similarity vs {topPlagiarism.other_student_label}.
                {plagiarismMatches.length > 1 &&
                  ` ${plagiarismMatches.length - 1} additional match${
                    plagiarismMatches.length > 2 ? "es" : ""
                  } recorded.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDiffOtherId(topPlagiarism.other_submission_id);
              setDiffOpen(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-amber-500 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-950 shadow-sm hover:bg-amber-100 md:self-center"
          >
            <GitCompareArrows size={14} />
            Open diff viewer
          </button>
        </div>
      )}

      <CodeReport results={results} submission={submission} />
    </div>
  );
}
