"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useMetadata } from "@/context";

/**
 * Side-by-side normalized Python structure (AST-unparsed) with matched lines highlighted.
 */
export default function PlagiarismDiffModal({
  open,
  onClose,
  submissionId,
  otherSubmissionId,
}) {
  const { api } = useMetadata();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !submissionId || !otherSubmissionId) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(
        `assessments/submissions/${submissionId}/plagiarism-diff/?other_submission_id=${otherSubmissionId}`,
      )
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          const d = err?.response?.data?.detail;
          setError(typeof d === "string" ? d : "Could not load structural diff.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, submissionId, otherSubmissionId, api]);

  if (!open) return null;

  const leftHi = new Set(data?.highlight_left_indices ?? []);
  const rightHi = new Set(data?.highlight_right_indices ?? []);
  const leftLines = data?.left?.lines ?? [];
  const rightLines = data?.right?.lines ?? [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-accent">
              Structural comparison
            </h3>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Normalized Python (comments and identifiers removed for alignment). Matching
              lines are highlighted.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading && (
            <p className="text-center text-xs font-bold uppercase text-text-muted">
              Loading…
            </p>
          )}
          {error && !loading && (
            <p className="text-center text-xs font-bold text-red-600">{error}</p>
          )}
          {!loading && !error && data && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {data.left?.student_label || "Submission A"}
                </p>
                <pre className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-slate-950/5 p-3 text-[11px] leading-relaxed">
                  {leftLines.map((line, i) => (
                    <div
                      key={`L-${i}`}
                      className={`flex gap-2 border-b border-border/30 py-0.5 pr-2 font-mono ${leftHi.has(i) ? "bg-amber-200/90 text-amber-950" : ""}`}
                    >
                      <span className="w-8 shrink-0 select-none text-right text-[9px] text-text-muted">
                        {i + 1}
                      </span>
                      <span className="min-w-0 whitespace-pre-wrap break-all">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {data.right?.student_label || "Submission B"}
                </p>
                <pre className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-slate-950/5 p-3 text-[11px] leading-relaxed">
                  {rightLines.map((line, i) => (
                    <div
                      key={`R-${i}`}
                      className={`flex gap-2 border-b border-border/30 py-0.5 pr-2 font-mono ${rightHi.has(i) ? "bg-amber-200/90 text-amber-950" : ""}`}
                    >
                      <span className="w-8 shrink-0 select-none text-right text-[9px] text-text-muted">
                        {i + 1}
                      </span>
                      <span className="min-w-0 whitespace-pre-wrap break-all">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
