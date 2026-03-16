"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Terminal,
  Trophy,
  ChevronDown,
  ChevronUp,
  Code2,
  Database,
  Eye,
} from "lucide-react";

export default function ResultsView({
  results = [],
  rubricResults = [],
  children = null,
}) {
  const [openTest, setOpenTest] = useState(null);

  // Stats Calculations
  const visibleTests = results.filter((t) => !t?.test_case?.is_hidden);
  const passedCount = visibleTests.filter((t) => t.is_success).length;
  const totalCount = visibleTests.length;
  const rubricTotal = rubricResults.reduce(
    (acc, r) => acc + (r?.points_awarded || 0),
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. SIMPLE PASS RATE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${passedCount === totalCount ? "bg-green-500" : "bg-amber-500"}`}
            />
            <p className="text-xl font-black text-accent uppercase tracking-tighter">
              {passedCount} of {totalCount} Test Cases Passed
            </p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Automated Evaluation Result • Total Manual Points: {rubricTotal}
          </p>
        </div>
        {children}
      </div>

      {/* 2. INSTRUCTOR RUBRIC (FLAT) */}
      {rubricResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
            <Trophy size={14} className="text-secondary" /> Manual Feedback
          </h3>
          <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden">
            {rubricResults.map((res, i) => (
              <div key={i} className="p-4 flex justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black text-accent uppercase">
                    {res.rubric_criteria_detail?.name || "Criterion"}
                  </p>
                  {res.optional_feedback && (
                    <p className="text-[11px] text-text-muted italic mt-1 leading-relaxed">
                      &ldquo;{res.optional_feedback}&ldquo;
                    </p>
                  )}
                </div>
                <span className="text-xs font-black text-accent shrink-0">
                  {res.points_awarded} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TEST CASE ACCORDIONS */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2 px-1">
          <Terminal size={14} className="text-secondary" /> Diagnostic Breakdown
        </h3>

        {visibleTests.map((test, i) => {
          const isOpen = openTest === i;
          return (
            <div
              key={i}
              className={`border rounded-xl transition-all overflow-hidden ${
                test.is_success
                  ? "border-border bg-white"
                  : "border-error/30 bg-red-50/20"
              }`}
            >
              {/* Accordion Trigger */}
              <button
                onClick={() => setOpenTest(isOpen ? null : i)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {test.is_success ? (
                    <CheckCircle2 className="text-green-500" size={18} />
                  ) : (
                    <XCircle className="text-error" size={18} />
                  )}
                  <span className="text-xs font-black text-accent uppercase tracking-tight">
                    Test Case {i + 1}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${test.is_success ? "text-green-600" : "text-error"}`}
                  >
                    {test.is_success ? "Success" : "Failed"}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-text-muted" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataBox
                      label="Input Provided"
                      content={test.test_case?.input_text}
                      icon={<Database size={12} />}
                    />
                    <DataBox
                      label="Expected Output"
                      content={test.test_case?.expected_output}
                      icon={<CheckCircle2 size={12} />}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <Code2 size={12} /> Console Output (Stdout/Stderr)
                    </p>
                    <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono overflow-x-auto border border-white/5 leading-relaxed">
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

/** * UI Sub-components */

function DataBox({ label, content, icon }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
        {icon} {label}
      </p>
      <div className="p-3 bg-slate-50 border border-border rounded-lg text-[11px] font-mono text-accent truncate">
        {content || <span className="italic opacity-40">None</span>}
      </div>
    </div>
  );
}
