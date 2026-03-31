"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import { PlagiarismModal } from "@/components/ui/sections";
import {
  Hash,
  InboxIcon,
  Calendar,
  ChevronRight,
  CircleDashed,
  CheckCircle2,
  Copy,
} from "lucide-react";

// ─── Badges ─────────────────────────────────────────────────────────────────

function PlagiarismBadge({ matches, onOpen }) {
  const [tooltipPos, setTooltipPos] = useState(null);
  const badgeRef = React.useRef(null);
  const canOpenModal = typeof onOpen === "function";

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
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${canOpenModal ? "cursor-pointer" : "cursor-default"} ${colorClass}`}
        onMouseEnter={canOpenModal ? handleMouseEnter : undefined}
        onMouseLeave={canOpenModal ? () => setTooltipPos(null) : undefined}
        onClick={canOpenModal ? onOpen : undefined}
      >
        <Copy size={10} />
        {pct}% Match
        {matches.length > 1 && <span className="opacity-70">+{matches.length - 1}</span>}
      </span>
      {tooltipPos && canOpenModal && (
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
  const { api, user } = useMetadata();
  const isInstructor = user?.role === "FA";

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
      {isInstructor && plagiarismModal && (
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
                        onOpen={
                          isInstructor ? () => setPlagiarismModal({ submission: sub }) : undefined
                        }
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
