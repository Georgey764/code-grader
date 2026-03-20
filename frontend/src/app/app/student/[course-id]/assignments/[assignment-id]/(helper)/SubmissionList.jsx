"use client";

import React, { useState } from "react";
import {
  FileText,
  Calendar,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  CircleDashed,
  Inbox,
} from "lucide-react";
import { CodeReport } from "@/components/ui/sections";

/**
 * Simplified List View
 */
function ViewList({
  setViewingSubmission,
  submissions = [],
  rubricCriteriaCount = 0,
  children = null,
  assignmentId = null,
}) {
  const [displayLimit, setDisplayLimit] = useState(5);

  const reversedSubmissions = [...submissions].reverse();
  const displayedSubmissions = reversedSubmissions.slice(0, displayLimit);
  const hasMore = reversedSubmissions.length > displayLimit;

  // Evaluation Logic
  const getEvaluationStatus = (sub) => {
    const isGraded =
      rubricCriteriaCount > 0 &&
      (sub?.rubric_results?.length || 0) >= rubricCriteriaCount;

    if (isGraded)
      return {
        label: "Graded",
        color: "text-green-600",
        icon: <CheckCircle2 size={14} />,
      };
    return {
      label: "No Grade",
      color: "text-amber-500",
      icon: <CircleDashed size={14} className="animate-spin-slow" />,
    };
  };

  return (
    <section className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Submission History
          </h2>
          <p className="text-[10px] text-text-muted font-bold uppercase mt-1">
            Total Attempts: {submissions.length}
          </p>
        </div>
        {children}
      </div>

      {submissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {/* DESKTOP/MOBILE UNIFIED LIST */}
          <div className="border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-16 text-center">
                    #
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted">
                    Date Submitted
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-32">
                    Evaluation
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted text-right w-24">
                    Report
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {displayedSubmissions.map((sub, index) => {
                  const evalStatus = getEvaluationStatus(sub);
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setViewingSubmission(sub)}
                      className="hover:bg-primary/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-4 text-center font-black text-xs text-text-muted">
                        {submissions.length - index}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-accent">
                          <Calendar
                            size={14}
                            className="text-secondary opacity-60"
                          />
                          {new Date(sub.created_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${evalStatus.color}`}
                        >
                          {evalStatus.icon}
                          {evalStatus.label}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
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

          {hasMore && (
            <button
              onClick={() => setDisplayLimit((prev) => prev + 5)}
              className="w-full py-3 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              Load Older Attempts <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

const EmptyState = () => (
  <div className="py-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center text-center">
    <Inbox size={32} className="text-border mb-3" />
    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
      No submissions found
    </p>
  </div>
);

/**
 * Report Viewer (Unchanged logic, cleaned UI)
 */
function ViewTestResult({
  viewingSubmission,
  setViewingSubmission,
  assignmentId,
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <h3 className="text-sm font-black text-accent uppercase tracking-widest">
          Diagnostic Report
        </h3>
        <button
          onClick={() => setViewingSubmission(null)}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
        >
          Close Report
        </button>
      </div>
      <CodeReport
        submission={viewingSubmission}
        assignmentId={assignmentId}
        results={viewingSubmission?.test_results || []}
      />
    </div>
  );
}

const SubmissionsList = ({
  assignmentId = null,
  submissions = [],
  rubricCriteriaCount = 0,
  children = null,
}) => {
  const [viewingSubmission, setViewingSubmission] = useState(null);
  return (
    <div className="w-full">
      {viewingSubmission ? (
        <ViewTestResult
          assignmentId={assignmentId}
          viewingSubmission={viewingSubmission}
          setViewingSubmission={setViewingSubmission}
        />
      ) : (
        <ViewList
          assignmentId={assignmentId}
          setViewingSubmission={setViewingSubmission}
          submissions={submissions}
          rubricCriteriaCount={rubricCriteriaCount}
        >
          {children}
        </ViewList>
      )}
    </div>
  );
};

export default SubmissionsList;
