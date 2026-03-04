"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldAlert,
  ChevronRight,
  Trophy,
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
        <div className="p-1 bg-primary w-full" /> {/* Warhawk Maroon Accent */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-h2 border-none pb-0 uppercase tracking-tighter flex items-center gap-2">
              <Terminal size={24} className="text-primary" />
              Autograder Test Summary
            </h2>
            <p className="text-caption mt-1 italic">
              Automated public test case results for this submission.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                Autograder Points Awarded
              </p>
              <p className="text-3xl font-black text-secondary leading-none">
                {totalEarned}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* --- Rubric Evaluation (if graded) --- */}
      {hasRubric && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <ChevronRight size={14} className="text-secondary" />
            Rubric Evaluation (Instructor Grading)
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2 bg-background rounded border border-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Total Rubric Points Awarded
              </span>
              <span className="text-sm font-black text-secondary">
                {rubricTotal}
              </span>
            </div>

            {rubricResults.map((res, index) => {
              const criterion = res.rubric_criteria_detail;
              const name =
                criterion?.name || `Criterion ${index + 1}`;
              const description = criterion?.description;
              const maxPts = criterion?.max_points;

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
                          {name}
                        </span>
                      </div>
                      {description && (
                        <p className="text-[11px] text-text-muted leading-snug">
                          {description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-accent">
                      {res.points_awarded}
                      {typeof maxPts === "number" ? ` / ${maxPts}` : ""} pts
                    </span>
                  </div>
                  {res.optional_feedback && (
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {res.optional_feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Individual Test Case Breakdown --- */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <ChevronRight size={14} className="text-secondary" />
          Detailed Breakdown
        </h3>

        {results.map((test, index) => {
          // Faculty can see hidden tests, but students cannot
          if (test?.test_case?.is_hidden) return null;

          const isSuccess = test?.is_success;
          const points = test?.test_case?.points || 0;

          return (
            <div
              key={test.id || index}
              className={`bg-surface rounded-lg border-l-4 shadow-sm transition-all overflow-hidden ${
                isSuccess ? "border-green-500" : "border-error"
              }`}
            >
              <div className="p-5 flex flex-col gap-4">
                {/* Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={isSuccess ? "text-green-500" : "text-error"}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-accent text-sm uppercase tracking-tight">
                        Test Case {index + 1}
                      </h4>
                      <p className="text-[10px] text-text-muted font-mono">
                        UID: {test?.test_case?.id?.slice(0, 8)}
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

                {/* Technical Output (Stdout/Stderr) */}
                {(test?.stdout || test?.stderr) && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={12} /> Console Logs
                    </p>
                    <div className="code-block bg-code-bg text-code-string p-4 rounded-md text-xs font-mono border-l-0 overflow-x-auto max-h-40">
                      {test?.stdout && (
                        <div className="mb-2 whitespace-pre-wrap">
                          <span className="text-code-keyword mr-2">
                            $ stdout:
                          </span>
                          {test.stdout}
                        </div>
                      )}
                      {test?.stderr && (
                        <div className="text-error/90 whitespace-pre-wrap">
                          <span className="font-bold mr-2">$ stderr:</span>
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

      {/* --- Footer / Note --- */}
      <div className="p-4 bg-background border border-border border-dashed rounded-lg flex gap-3 items-start">
        <ShieldAlert size={18} className="text-text-muted shrink-0 mt-0.5" />
        <p className="text-[11px] text-text-muted leading-relaxed">
          <strong className="text-accent uppercase">Privacy Note:</strong> Your
          code was executed in a sandboxed environment. Any hidden test cases
          are not shown here but are calculated in your final grade on the
          dashboard.
        </p>
      </div>
    </section>
  );
}
