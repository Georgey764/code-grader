"use client";

import React from "react";
import {
  Terminal,
  Check,
  X,
  Trophy,
  CornerDownRight,
  ListChecks,
  Clock,
  Code,
} from "lucide-react";

export default function ResultsView({ results = [], children = null }) {
  // Logic to calculate score from public tests - rounded to 2 decimal places
  const rawScore = results.reduce(
    (acc, test) =>
      !test?.test_case?.is_hidden && test?.is_success
        ? acc + (test?.test_case?.points || 0)
        : acc,
    0,
  );
  const score = rawScore.toFixed(2);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Score Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-accent">
              Results
            </h2>
            <p className="text-[10px] text-text-muted font-bold uppercase">
              Public Test Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-0.5">
              Points
            </p>
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-secondary" />
              <span className="text-2xl font-black text-accent leading-none">
                {score}
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>

      {/* 2. Test List */}
      <div className="space-y-4">
        {results.map((test, index) => {
          if (test?.test_case?.is_hidden) return null;
          const passed = test?.is_success;
          const testCase = test?.test_case;

          return (
            <div
              key={index}
              className="bg-surface rounded-lg border border-border transition-all overflow-hidden shadow-sm"
            >
              <div className="p-4 sm:p-5 space-y-5">
                {/* Header Row: Status & Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1 rounded-full ${passed ? "bg-green-500 text-white" : "bg-error text-white"}`}
                    >
                      {passed ? (
                        <Check size={14} strokeWidth={4} />
                      ) : (
                        <X size={14} strokeWidth={4} />
                      )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight text-accent">
                      Case {index + 1}
                    </span>
                  </div>

                  {/* Rounded Metrics */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded text-[9px] font-bold text-text-muted uppercase tracking-tighter">
                      <Clock size={12} className="text-primary" />
                      {Number(test.duration || 0).toFixed(2)} ms
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded text-[9px] font-bold text-text-muted uppercase tracking-tighter">
                      <Code size={12} className="text-secondary" />
                      Exit: {test.exit_code}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        passed
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-error"
                      }`}
                    >
                      {passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <RequirementBox
                    label="Input"
                    icon={<CornerDownRight size={12} />}
                    content={testCase?.input_text}
                  />
                  <RequirementBox
                    label="Expected"
                    icon={<ListChecks size={12} />}
                    content={testCase?.expected_output}
                  />
                </div>

                {/* Points and Logs breakdown */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">
                    Execution Logs
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-accent">
                    Weight: {Number(testCase?.points || 0).toFixed(2)} PTS
                  </p>
                </div>

                {(test?.stdout || test?.stderr) && (
                  <div className="bg-slate-950 p-4 rounded-md font-mono text-[11px] border border-white/5 overflow-x-auto">
                    {test?.stdout && (
                      <div className="text-slate-300">
                        <span className="text-green-500 font-bold mr-2">
                          OUT:
                        </span>
                        {test.stdout}
                      </div>
                    )}
                    {test?.stderr && (
                      <div className="text-red-400 mt-1">
                        <span className="font-bold mr-2">ERR:</span>
                        {test.stderr}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequirementBox({ label, icon, content }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-text-muted px-1">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-widest">
          {label}
        </p>
      </div>
      <div className="p-3 bg-slate-50 border border-border rounded text-[11px] font-mono text-accent min-h-[40px] whitespace-pre-wrap break-all">
        {content || <span className="opacity-40 italic">None</span>}
      </div>
    </div>
  );
}
