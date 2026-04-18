"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Loader2, Users, X } from "lucide-react";

function LineBlock({ lines, highlightLines, title }) {
  const set = new Set(highlightLines || []);
  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <p className="text-[10px] font-black uppercase text-text-muted mb-1 tracking-wide">
        {title}
      </p>
      <pre className="text-[11px] leading-relaxed font-mono overflow-auto max-h-[420px] rounded-lg border border-slate-800 bg-slate-950 text-slate-100 p-0 m-0">
        {(lines || []).map((line, i) => {
          const n = i + 1;
          const hi = set.has(n);
          return (
            <div
              key={n}
              className={`flex ${hi ? "bg-amber-500/20 border-l-4 border-amber-400" : "border-l-4 border-transparent"}`}
            >
              <span className="shrink-0 w-10 text-right pr-2 text-slate-500 select-none border-r border-slate-800 py-0.5">
                {n}
              </span>
              <span className="whitespace-pre-wrap pl-2 pr-2 py-0.5 flex-1 min-w-0">
                {line}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

export default function PlagiarismCohortModal({
  open,
  onClose,
  submissionId,
  api,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open || !submissionId) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setData(null);
    api
      .post(`plag-detector/submissions/${submissionId}/cohort/`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled)
          setErr(
            e?.response?.data?.detail ||
              e?.message ||
              "Could not run cohort plagiarism check.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, submissionId, api]);

  if (!open || typeof document === "undefined") return null;

  const content = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm w-full h-full cursor-default border-0 p-0"
        aria-label="Close dialog backdrop"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plag-modal-title"
        className="relative z-10 w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-border bg-surface shrink-0">
          <div className="min-w-0">
            <h2
              id="plag-modal-title"
              className="text-sm font-black uppercase tracking-tight text-accent flex items-center gap-2"
            >
              <Users size={18} className="shrink-0 text-primary" /> Cohort
              plagiarism
            </h2>
            {data ? (
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mt-1.5 leading-relaxed">
                Course code{" "}
                <span className="text-accent font-black">{data.short_name}</span> ·{" "}
                {data.assignment_name} · {data.peers_compared} peer submission(s)
                scanned
              </p>
            ) : (
              <p className="text-[10px] font-bold text-text-muted uppercase mt-1 leading-relaxed">
                Other students only — same student&apos;s other attempts are never
                compared. Same assignment name &amp; language across your sections with
                this course short name.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </header>
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">
                Scanning cohort…
              </p>
            </div>
          ) : err ? (
            <p className="text-sm text-red-600 font-medium">{err}</p>
          ) : data?.message ? (
            <p className="text-sm text-text-muted">{data.message}</p>
          ) : !data?.matches?.length ? (
            <p className="text-sm text-text-muted leading-relaxed">
              No peer submissions in other sections reached the similarity threshold
              (structural k-grams + fingerprints). That does not prove originality.
            </p>
          ) : (
            data.matches.map((m) => (
              <article
                key={m.peer_submission_id || m.submission_id}
                className="rounded-xl border border-border p-4 space-y-4 bg-slate-50/60"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-accent text-sm uppercase tracking-tight">
                      {m.student_display}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mt-0.5">
                      {m.course_display}
                    </p>
                    <p className="text-[10px] font-mono text-slate-600 mt-1.5 break-all">
                      <span className="font-black uppercase text-text-muted">
                        Peer submission id{" "}
                      </span>
                      {m.peer_submission_id}
                    </p>
                    {m.peer_submitted_at ? (
                      <p className="text-[10px] font-bold text-text-muted uppercase mt-1">
                        Submitted{" "}
                        {new Date(m.peer_submitted_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-amber-700 tabular-nums">
                      {m.score}%
                    </p>
                    <p className="text-[9px] font-black uppercase text-amber-900/90 max-w-[200px]">
                      {m.verdict}
                    </p>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
                  Fingerprint Jaccard {m.jaccard}% · Token overlap{" "}
                  {m.token_overlap}% · Shared prints {m.shared_fingerprints}
                </p>
                <p className="text-[9px] font-bold text-amber-800/90 uppercase">
                  Highlighted lines share identical normalized k-gram patterns (not
                  necessarily verbatim text).
                </p>
                <div className="flex flex-col xl:flex-row gap-4">
                  <LineBlock
                    lines={data.query_lines}
                    highlightLines={m.query_highlight_lines}
                    title="This submission"
                  />
                  <LineBlock
                    lines={m.other_lines}
                    highlightLines={m.other_highlight_lines}
                    title="Peer submission"
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
