"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldAlert,
  ChevronRight,
  Trophy,
  CornerDownRight,
  Code2,
} from "lucide-react";

export default function ResultsView({
  results = [],
  rubricResults = [],
  children = null,
}) {
  // Calculate total points earned from public test cases
  const totalEarned = results.reduce(
    (acc, test) =>
      !test?.test_case?.is_hidden && test?.is_success
        ? acc + (test?.test_case?.points || 0)
        : acc,
    0,
  );

  const rubricTotal = rubricResults.reduce(
    (acc, res) => acc + (res?.points_awarded || 0),
    0,
  );

  const hasRubric = rubricResults && rubricResults.length > 0;

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Summary Overview Card --- */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="p-1 bg-primary w-full" />
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-h2 border-none pb-0 uppercase tracking-tighter flex items-center gap-2">
              <Terminal size={24} className="text-primary" />
              Evaluation Summary
            </h2>
            <p className="text-caption mt-1 italic">
              Automated and manual grading results for this attempt.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                Autograder Score
              </p>
              <p className="text-3xl font-black text-secondary leading-none">
                {totalEarned}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* --- Rubric Evaluation Section --- */}
      {hasRubric && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <ChevronRight size={14} className="text-secondary" />
            Instructor Rubric Results
          </h3>
          <div className="space-y-3">
            {rubricResults.map((res, index) => {
              const criterion = res.rubric_criteria_detail;
              return (
                <div
                  key={res.id || index}
                  className="bg-surface rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-secondary" />
                        <span className="text-xs font-black uppercase tracking-widest text-accent">
                          {criterion?.name || `Criterion ${index + 1}`}
                        </span>
                      </div>
                      {criterion?.description && (
                        <p className="text-[11px] text-text-muted leading-snug">
                          {criterion.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-accent shrink-0">
                      {res.points_awarded} / {criterion?.max_points || "?"} pts
                    </span>
                  </div>
                  {res.optional_feedback && (
                    <div className="mt-2 p-2 bg-slate-50 border-l-2 border-secondary rounded-r text-[11px] text-text-muted italic">
                      &quot;{res.optional_feedback}&quot;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Detailed Test Case Breakdown --- */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <ChevronRight size={14} className="text-secondary" />
          Test Execution Details
        </h3>

        {results.map((test, index) => {
          if (test?.test_case?.is_hidden) return null;

          const isSuccess = test?.is_success;
          const points = test?.test_case?.points || 0;
          const testCase = test?.test_case;

          return (
            <div
              key={test.id || index}
              className={`bg-surface rounded-lg border-l-4 shadow-sm transition-all overflow-hidden ${
                isSuccess ? "border-green-500" : "border-error"
              }`}
            >
              <div className="p-5 space-y-6">
                {/* Header: Title and Points */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={isSuccess ? "text-green-500" : "text-error"}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <XCircle size={22} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-accent text-sm uppercase tracking-tight">
                        Test Case {index + 1}
                      </h4>
                      <p className="text-[10px] text-text-muted font-mono">
                        UID: {testCase?.id?.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        isSuccess
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-error"
                      }`}
                    >
                      {isSuccess ? "Passed" : "Failed"}
                    </span>
                    <div className="bg-background px-3 py-1 rounded border border-border flex items-center gap-2">
                      <Trophy size={12} className="text-secondary" />
                      <span className="text-xs font-bold text-accent">
                        {isSuccess ? points : 0} / {points} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirements: Input & Expected Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <CornerDownRight size={12} className="text-secondary" />{" "}
                      Standard Input
                    </p>
                    <pre className="p-3 bg-slate-50 border border-border rounded text-[11px] font-mono text-accent min-h-[50px] overflow-x-auto">
                      {testCase?.input_text || (
                        <span className="italic opacity-50">
                          No input provided
                        </span>
                      )}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-primary" />{" "}
                      Expected Output
                    </p>
                    <pre className="p-3 bg-slate-50 border border-border rounded text-[11px] font-mono text-accent min-h-[50px] overflow-x-auto">
                      {testCase?.expected_output || (
                        <span className="italic opacity-50">
                          No output expected
                        </span>
                      )}
                    </pre>
                  </div>
                </div>

                {/* Actual Results: Stdout/Stderr */}
                {(test?.stdout || test?.stderr) && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Code2 size={12} /> Execution Logs
                    </p>
                    <div className="code-block bg-[#1e1e1e] text-slate-300 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-48 border border-white/5">
                      {test?.stdout && (
                        <div className="mb-2 whitespace-pre-wrap text-white">
                          <span className="text-green-400 mr-2">$ stdout:</span>
                          {test.stdout}
                        </div>
                      )}
                      {test?.stderr && (
                        <div className="text-red-400 whitespace-pre-wrap font-bold">
                          <span className="mr-2">$ stderr:</span>
                          {test.stderr}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Compliance Footer --- */}
      <footer className="p-4 bg-background border border-border border-dashed rounded-lg flex gap-3 items-start opacity-70">
        <ShieldAlert size={18} className="text-text-muted shrink-0 mt-0.5" />
        <p className="text-[10px] text-text-muted leading-relaxed uppercase tracking-wide">
          <strong className="text-accent">Integrity Notice:</strong> Hidden test
          cases contribute to the aggregate grade but are omitted here to
          prevent hard-coding.
        </p>
      </footer>
    </section>
  );
}
