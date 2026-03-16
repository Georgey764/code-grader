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
  Code,
  Trophy,
  MessageSquare,
} from "lucide-react";

export default function ResultsView({
  results = [],
  submission = null,
  attemptNumber = 1,
  children = null,
}) {
  const [openTest, setOpenTest] = useState(null);

  // Mapping the Enum back to readable labels for the UI
  const levelMap = {
    1: { label: "Beginning", color: "text-red-600", bg: "bg-red-50" },
    2: { label: "Developing", color: "text-orange-600", bg: "bg-orange-50" },
    3: { label: "Proficient", color: "text-amber-600", bg: "bg-amber-50" },
    4: { label: "Accomplished", color: "text-blue-600", bg: "bg-blue-50" },
    5: { label: "Exceptional", color: "text-green-600", bg: "bg-green-50" },
  };

  const visibleTests = results.filter((t) => !t?.test_case?.is_hidden);
  const passedCount = visibleTests.filter((t) => t.is_success).length;
  const totalCount = visibleTests.length;

  const rubricResults = submission?.rubric_results || [];
  const isGraded = rubricResults.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* 1. ATTEMPT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
            <Hash size={12} /> Attempt {attemptNumber}
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-accent uppercase tracking-tighter leading-none">
            {passedCount} of {totalCount} Tests Passed
          </h2>

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                isGraded ? "text-green-600" : "text-amber-500"
              }`}
            >
              {isGraded ? <Trophy size={12} /> : null}
              {isGraded ? "Evaluation Complete" : "Pending Instructor Review"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {submission?.submitted_file && (
            <a
              href={submission.submitted_file}
              download
              className="flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-primary transition-all group"
            >
              <div className="p-1.5 bg-white/10 rounded">
                <FileCode size={18} className="text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">
                  Student Work
                </p>
                <p className="text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                  Download Submission <Download size={14} />
                </p>
              </div>
            </a>
          )}
          {children}
        </div>
      </div>

      {/* 2. RUBRIC FEEDBACK (Human Evaluation) */}
      {isGraded && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted px-1">
            Faculty Evaluation Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rubricResults.map((res) => {
              const level = levelMap[res.points] || {
                label: "Unknown",
                color: "text-slate-400",
                bg: "bg-slate-50",
              };
              return (
                <div
                  key={res.id}
                  className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest opacity-60">
                      {res.rubric_criteria_name || "Criterion"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${level.bg} ${level.color} border border-current/10`}
                    >
                      {level.label} (Level {res.points})
                    </span>
                  </div>
                  {res.optional_feedback ? (
                    <div className="flex gap-2 text-xs text-text-main leading-relaxed italic border-l-2 border-secondary/30 pl-3">
                      <MessageSquare
                        size={14}
                        className="text-secondary shrink-0 mt-0.5"
                      />
                      &quot;{res.optional_feedback}&quot;
                    </div>
                  ) : (
                    <p className="text-[10px] text-text-muted italic opacity-50">
                      No additional comments provided.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DIAGNOSTIC ACCORDIONS (Automated Output) */}
      <div className="space-y-1.5 pt-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-3 px-1">
          Machine Diagnostic Output
        </h3>

        {visibleTests.map((test, index) => {
          const passed = test?.is_success;
          const isOpen = openTest === index;

          return (
            <div
              key={index}
              className={`border rounded-xl transition-all overflow-hidden ${
                passed
                  ? "bg-white border-border/60"
                  : "bg-red-50/20 border-error/30"
              }`}
            >
              <button
                onClick={() => setOpenTest(isOpen ? null : index)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1 rounded-full ${passed ? "bg-green-500 text-white" : "bg-error text-white"}`}
                  >
                    {passed ? (
                      <Check size={11} strokeWidth={4} />
                    ) : (
                      <X size={11} strokeWidth={4} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-tight">
                    Test Case {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${passed ? "text-green-600" : "text-error"}`}
                  >
                    {passed ? "Success" : "Failed"}
                  </span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                    <DataBox
                      label="Input"
                      icon={<CornerDownRight size={12} />}
                      content={test.test_case?.input_text}
                    />
                    <DataBox
                      label="Expected Output"
                      icon={<ListChecks size={12} />}
                      content={test.test_case?.expected_output}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <Code size={12} /> Execution Logs
                    </p>
                    <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed border border-white/5 max-h-40">
                      {test.stdout ||
                        test.stderr ||
                        "No program output detected."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataBox({ label, icon, content }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
        {icon} {label}
      </p>
      <div className="p-3 bg-slate-50 border border-border rounded-lg text-[11px] font-mono text-accent whitespace-pre-wrap break-all">
        {content || <span className="opacity-40 italic">None</span>}
      </div>
    </div>
  );
}
