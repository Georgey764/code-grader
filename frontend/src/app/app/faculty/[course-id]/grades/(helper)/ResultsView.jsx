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
} from "lucide-react";

export default function ResultsView({
  results = [],
  submission = null,
  studentDetail = null,
  attemptNumber = "Final",
  children = null,
}) {
  const [openTest, setOpenTest] = useState(null);

  const levelMap = {
    1: { label: "Beginning", color: "text-red-600" },
    2: { label: "Developing", color: "text-orange-600" },
    3: { label: "Proficient", color: "text-amber-600" },
    4: { label: "Accomplished", color: "text-blue-600" },
    5: { label: "Exceptional", color: "text-green-600" },
  };

  const visibleTests = results.filter((t) => !t?.test_case?.is_hidden);
  const passedCount = visibleTests.filter((t) => t.is_success).length;
  const rubricResults = submission?.rubric_results || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- GLANCEABLE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Left Side: Identity & Core Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">
              {studentDetail?.full_name || "Student Result"}
            </h2>
            <div className="px-2 py-0.5 bg-accent text-white rounded text-[10px] font-black uppercase tracking-widest">
              {submission?.total_points || 0}%
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
            <span className="flex items-center gap-1">
              <Hash size={12} className="text-secondary" /> Attempt{" "}
              {attemptNumber}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} /> {studentDetail?.username}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />{" "}
              {new Date(submission?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Right Side: Action Buttons (Locked together) */}
        <div className="flex items-center gap-2 shrink-0">
          {submission?.submitted_file && (
            <a
              href={submission.submitted_file}
              download
              className="p-2.5 bg-slate-100 text-accent rounded-lg hover:bg-slate-200 transition-colors border border-border"
              title="Download Source"
            >
              <Download size={18} />
            </a>
          )}
          {/* This will contain your "Grade Now" or "Back" buttons */}
          <div className="flex items-center gap-2">{children}</div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tests Passed"
          value={`${passedCount}/${visibleTests.length}`}
          sub="Automated"
        />
        <StatCard
          label="Rubric Points"
          value={`${submission?.total_points || 0}%`}
          sub="Instructor"
        />
      </div>

      {/* --- INSTRUCTOR FEEDBACK --- */}
      {rubricResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Criteria Review
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rubricResults.map((res, i) => (
              <div
                key={i}
                className="p-4 bg-white border border-border rounded-xl flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-accent uppercase">
                    {res.criteria_name}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase ${levelMap[res.points]?.color}`}
                  >
                    {levelMap[res.points]?.label}
                  </span>
                </div>
                {res.optional_feedback && (
                  <p className="text-xs text-text-muted italic flex gap-2">
                    <MessageSquare size={12} className="shrink-0 mt-0.5" />{" "}
                    &quot;
                    {res.optional_feedback}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TEST CASE LIST --- */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          Test Diagnostics
        </h4>
        {results.map((test, i) => (
          <div
            key={i}
            className="border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenTest(openTest === i ? null : i)}
              className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {test.is_success ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <X size={16} className="text-red-600" />
                )}
                <span className="text-xs font-bold text-accent uppercase tracking-tight">
                  Case {i + 1}: {test.test_case?.name}
                </span>
              </div>
              {openTest === i ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {openTest === i && (
              <div className="p-4 bg-slate-50 border-t border-border space-y-4 animate-in slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-4">
                  <DataBit label="Input" value={test.test_case?.text_input} />
                  <DataBit
                    label="Expected"
                    value={test.test_case?.expected_output}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-text-muted">
                    Execution Logs
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto">
                    {test.stdout || "No output."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="p-4 bg-white border border-border rounded-2xl">
      <p className="text-[9px] font-black uppercase text-text-muted tracking-widest">
        {label}
      </p>
      <p className="text-xl font-black text-accent">{value}</p>
      <p className="text-[9px] font-bold text-primary uppercase">{sub}</p>
    </div>
  );
}

function DataBit({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-[9px] font-black uppercase text-text-muted flex items-center gap-1">
        <CornerDownRight size={10} /> {label}
      </span>
      <div className="whitespace-pre-wrap p-2 bg-white border border-border rounded text-[10px] font-mono truncate">
        {value || "None"}
      </div>
    </div>
  );
}
