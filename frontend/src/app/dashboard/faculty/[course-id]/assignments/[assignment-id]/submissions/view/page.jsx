"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Hash,
  InboxIcon,
  Calendar,
  ChevronRight,
  CircleDashed,
  CheckCircle2,
  Copy,
  X,
  AlertTriangle,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeLineMatches(codeA, codeB) {
  const linesA = (codeA || "").split("\n");
  // Only consider lines with meaningful content (>15 chars after trimming)
  const setB = new Set(
    (codeB || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 15)
  );
  return linesA.map((line) => ({
    text: line,
    isMatch: line.trim().length > 15 && setB.has(line.trim()),
  }));
}

// ─── Plagiarism Comparison Modal ─────────────────────────────────────────────

function PlagiarismModal({ submission, matches, onClose, api }) {
  const [selected, setSelected] = useState(null);
  const [matchedSub, setMatchedSub] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  const handleSelect = async (match) => {
    if (selected?.matched_submission_id === match.matched_submission_id) return;
    setSelected(match);
    setLoadingMatch(true);
    try {
      const res = await api.get(`assessments/submissions/${match.matched_submission_id}/`);
      setMatchedSub(res.data);
    } catch (err) {
      console.error("Failed to fetch matched submission", err);
    } finally {
      setLoadingMatch(false);
    }
  };

  const sortedMatches = [...matches].sort((a, b) => b.similarity_score - a.similarity_score);

  const currentLines = selected
    ? computeLineMatches(submission.submitted_file, matchedSub?.submitted_file)
    : [];
  const matchedLines = selected
    ? computeLineMatches(matchedSub?.submitted_file, submission.submitted_file)
    : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col overflow-hidden"
        style={{ height: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-black text-accent text-sm uppercase tracking-widest">
                Plagiarism Report
              </h2>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide mt-0.5">
                {matches.length} similar submission{matches.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-text-muted hover:text-accent"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: match list */}
          <div className="w-64 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50">
            <p className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted border-b border-slate-200">
              Violations
            </p>
            <div className="overflow-y-auto flex-1">
              {sortedMatches.map((m) => {
                const pct = Math.round(m.similarity_score * 100);
                const isHigh = m.similarity_score >= 0.6;
                const isActive = selected?.matched_submission_id === m.matched_submission_id;
                return (
                  <button
                    key={m.matched_submission_id}
                    onClick={() => handleSelect(m)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-200 transition-colors ${
                      isActive ? "bg-white border-l-2 border-l-red-500" : "hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-accent truncate">{m.student_name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                          isHigh ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {pct}% similar
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main: code comparison */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Copy size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-text-muted">Select a student from the list to compare code</p>
                </div>
              </div>
            ) : loadingMatch ? (
              <div className="flex-1 flex items-center justify-center">
                <CircleDashed size={24} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                {/* Current submission */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                      This Submission
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-950">
                    <table className="w-full text-xs font-mono">
                      <tbody>
                        {currentLines.map((line, i) => (
                          <tr
                            key={i}
                            className={line.isMatch ? "bg-amber-500/20" : ""}
                          >
                            <td className="select-none px-3 py-0 text-slate-600 text-right w-10 border-r border-slate-800 text-[10px]">
                              {i + 1}
                            </td>
                            <td className="px-4 py-0 text-slate-200 whitespace-pre leading-5">
                              {line.text || " "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Matched submission */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                      {selected.student_name}
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-950">
                    <table className="w-full text-xs font-mono">
                      <tbody>
                        {matchedLines.map((line, i) => (
                          <tr
                            key={i}
                            className={line.isMatch ? "bg-amber-500/20" : ""}
                          >
                            <td className="select-none px-3 py-0 text-slate-600 text-right w-10 border-r border-slate-800 text-[10px]">
                              {i + 1}
                            </td>
                            <td className="px-4 py-0 text-slate-200 whitespace-pre leading-5">
                              {line.text || " "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer legend */}
        {selected && !loadingMatch && (
          <div className="px-6 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/60" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                Matching lines
              </span>
            </div>
            <span className="text-[10px] text-text-muted">
              Highlighted lines appear in both submissions
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badges ─────────────────────────────────────────────────────────────────

function PlagiarismBadge({ matches, onOpen }) {
  const [tooltipPos, setTooltipPos] = useState(null);
  const badgeRef = React.useRef(null);

  if (!matches || matches.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700">
        <CheckCircle2 size={10} /> Clean
      </span>
    );
  }

  const highest = Math.max(...matches.map((m) => m.similarity_score));
  const pct = Math.round(highest * 100);
  const isHigh = highest >= 0.6;
  const colorClass = isHigh ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600";

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
    }
  };

  return (
    <>
      <span
        ref={badgeRef}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer ${colorClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltipPos(null)}
        onClick={onOpen}
      >
        <Copy size={10} />
        {pct}% Match
        {matches.length > 1 && <span className="opacity-70">+{matches.length - 1}</span>}
      </span>
      {tooltipPos && (
        <div
          className="fixed z-[9999] w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3 text-xs"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setTooltipPos(null)}
        >
          <p className="font-bold text-accent mb-1">Similar Submissions</p>
          <p className="text-[10px] text-text-muted mb-2">Click to view code comparison</p>
          <ul className="space-y-1.5">
            {[...matches]
              .sort((a, b) => b.similarity_score - a.similarity_score)
              .map((m, i) => (
                <li key={i} className="flex justify-between items-center gap-2 text-[10px]">
                  <span className="text-text-muted truncate">{m.student_name}</span>
                  <span className={`font-black shrink-0 ${m.similarity_score >= 0.6 ? "text-red-600" : "text-amber-600"}`}>
                    {Math.round(m.similarity_score * 100)}%
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SubmissionsPage() {
  const param = useParams();
  const assignmentId = param["assignment-id"];
  const { api } = useMetadata();

  const searchParams = useSearchParams();
  const rosterId = searchParams.get("roster_id");
  const groupId = searchParams.get("group_id");

  const [submissions, setSubmissions] = useState([]);
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plagiarismModal, setPlagiarismModal] = useState(null); // { submission }

  const router = useRouter();
  const courseId = param["course-id"];

  const fetchPageData = async () => {
    try {
      let url_call = `assessments/submissions/?assignment_id=${assignmentId}`;
      if (rosterId) url_call += `&roster_id=${rosterId}`;
      if (groupId) url_call += `&group_id=${groupId}`;

      const [subRes, assignRes] = await Promise.all([
        api.get(url_call),
        api.get(`assignments/${assignmentId}/`),
      ]);

      setSubmissions([...subRes?.data]);
      setAssignmentData(assignRes?.data);
    } catch (err) {
      console.error("Error fetching page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [api, assignmentId, groupId, rosterId]);

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      {plagiarismModal && (
        <PlagiarismModal
          submission={plagiarismModal.submission}
          matches={plagiarismModal.submission.plagiarism_matches}
          onClose={() => setPlagiarismModal(null)}
          api={api}
        />
      )}

      {submissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-24">
                  Attempt
                </th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-40">
                  Status
                </th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-36">
                  Plagiarism
                </th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted text-right w-24">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {submissions.map((sub, index) => {
                const attemptNum = submissions.length - index;
                const rubricCount = assignmentData?.rubric_criterias?.length || 0;
                const resultsCount = sub?.rubric_results?.length || 0;
                const isGraded = rubricCount > 0 && resultsCount >= rubricCount;

                return (
                  <tr
                    key={sub.id}
                    onClick={() =>
                      router.push(`/dashboard/faculty/${courseId}/grades/${sub.id}`)
                    }
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-black text-accent text-xs">
                        <Hash size={14} className="text-secondary" /> {attemptNum}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <Calendar size={14} className="text-primary opacity-60" />
                        {new Date(sub.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                          isGraded ? "text-green-600" : "text-amber-500"
                        }`}
                      >
                        {isGraded ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <CircleDashed size={14} className="animate-spin-slow" />
                        )}
                        {isGraded ? "Graded" : "Ungraded"}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <PlagiarismBadge
                        matches={sub.plagiarism_matches}
                        onOpen={() => setPlagiarismModal({ submission: sub })}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight
                        size={18}
                        className="inline text-border group-hover:text-primary transition-transform group-hover:translate-x-1"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
      <InboxIcon size={48} className="text-border mb-4 opacity-20" />
      <h3 className="text-sm font-black text-accent uppercase tracking-widest">
        No Submissions
      </h3>
      <p className="text-[10px] text-text-muted font-bold uppercase mt-1">
        Activity will appear here once students submit work.
      </p>
    </div>
  );
}
