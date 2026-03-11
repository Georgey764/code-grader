"use client";

import React, { useState } from "react";
import {
  FileText,
  InboxIcon,
  Hash,
  List,
  Calendar,
  ChevronRight,
  ChevronDown,
  Clock,
  ExternalLink,
} from "lucide-react";
import ResultsView from "./ResultsView";

/**
 * Renders the detailed diagnostic report for a specific submission
 */
function ViewTestResult({ viewingSubmission = null, setViewingSubmission }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <ResultsView
        results={viewingSubmission?.test_results || []}
        rubricResults={viewingSubmission?.rubric_results || []}
      >
        <button
          onClick={() => setViewingSubmission(null)}
          className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 sm:py-2.5 rounded shadow-md font-black uppercase text-[10px] tracking-[0.2em] hover:bg-accent transition-all active:scale-95"
        >
          <List size={16} className="text-secondary" />
          Back to History
        </button>
      </ResultsView>
    </div>
  );
}

/**
 * Main list view for student submissions
 */
function ViewList({
  setViewingSubmission,
  submissions = [],
  rubricCriteriaCount = 0,
  children = null,
}) {
  // Pagination State
  const INITIAL_LIMIT = 5;
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETE":
        return "bg-green-50 text-green-700 border-green-200";
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "INCOMPLETE":
        return "bg-red-50 text-error border-error/20";
      case "PENDING":
        return "bg-secondary/10 text-secondary border-secondary/20 font-black";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    return new Date(dateString).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const reversedSubmissions = [...submissions].reverse();
  const displayedSubmissions = reversedSubmissions.slice(0, displayLimit);
  const hasMore = reversedSubmissions.length > displayLimit;

  const isSubmissionGraded = (sub) => {
    if (!rubricCriteriaCount) return false;
    const gradedCount = sub?.rubric_results?.length || 0;
    return gradedCount >= rubricCriteriaCount;
  };

  return (
    <section className="animate-in fade-in duration-500">
      {/* Title & Action Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-10">
        <div>
          <h1 className="text-h2 uppercase tracking-tighter flex items-center gap-2 text-xl sm:text-2xl">
            <FileText className="text-primary" size={24} />
            Submission History
          </h1>
          <p className="text-caption mt-1">
            Displaying{" "}
            <span className="text-accent font-bold">
              {displayedSubmissions.length}
            </span>{" "}
            of{" "}
            <span className="text-accent font-bold">{submissions.length}</span>{" "}
            total attempts.
          </p>
        </div>
        <div className="w-full md:w-auto">{children}</div>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-background border-2 border-dashed border-border rounded-lg text-center px-4">
          <div className="p-4 bg-surface rounded-full shadow-sm mb-4">
            <InboxIcon className="text-border" size={40} />
          </div>
          <h3 className="text-sm font-black text-accent uppercase tracking-widest">
            No activity found
          </h3>
          <p className="text-[11px] text-text-muted max-w-xs mt-2">
            Upload a .py file to begin.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {displayedSubmissions.map((sub, index) => (
              <div
                key={sub.id}
                className="bg-surface border border-border rounded-lg p-4 shadow-sm relative overflow-hidden active:bg-slate-50 transition-colors"
                onClick={() => setViewingSubmission(sub)}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-secondary" />
                    <span className="font-black text-accent text-xs">
                      Attempt {submissions.length - index}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(sub.status)}`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-accent">
                    <Calendar size={14} className="text-primary" />
                    {formatDate(sub.created_at)}
                  </div>
                  {rubricCriteriaCount > 0 && (
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-text-muted">
                      <Clock
                        size={12}
                        className={
                          isSubmissionGraded(sub)
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      />
                      {isSubmissionGraded(sub) ? "Graded" : "Not graded"}
                    </div>
                  )}
                </div>
                <button className="w-full py-2.5 bg-background border border-border rounded text-[10px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-2">
                  View Results <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-hidden border border-border rounded-lg bg-surface shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                <thead>
                  <tr className="bg-background border-b border-border">
                    <th className="px-6 py-4 text-subheading text-[10px] w-28">
                      Attempt
                    </th>
                    <th className="px-6 py-4 text-subheading text-[10px]">
                      Date Submitted
                    </th>
                    <th className="px-6 py-4 text-subheading text-[10px] w-40">
                      Status
                    </th>
                    <th className="px-6 py-4 text-subheading text-[10px] text-right w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {displayedSubmissions.map((sub, index) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-accent">
                          <Hash size={14} className="text-secondary" />
                          <span className="font-black text-xs">
                            {submissions.length - index}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-xs font-bold text-accent">
                            <Calendar size={14} className="text-primary" />
                            {formatDate(sub.created_at)}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1 uppercase tracking-tighter font-mono italic">
                            ID: {sub.id?.slice(0, 8)}
                          </div>
                          {rubricCriteriaCount > 0 && (
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-text-muted mt-1">
                              <Clock
                                size={12}
                                className={
                                  isSubmissionGraded(sub)
                                    ? "text-green-500"
                                    : "text-amber-500"
                                }
                              />
                              {isSubmissionGraded(sub)
                                ? "Graded"
                                : "Not graded"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(sub.status)}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setViewingSubmission(sub)}
                          className="cursor-pointer group/btn inline-flex items-center gap-1.5 text-primary hover:text-accent text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          View Report
                          <ExternalLink
                            size={14}
                            className="group-hover/btn:translate-x-0.5 transition-transform"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOAD MORE BUTTON */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 5)}
                className="group cursor-pointer flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Load Older Submissions
                </span>
                <div className="p-2 bg-background border border-border rounded-full group-hover:bg-primary/5 group-hover:border-primary transition-all">
                  <ChevronDown
                    size={20}
                    className="group-hover:translate-y-0.5 transition-transform"
                  />
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const SubmissionsList = ({
  submissions = [],
  rubricCriteriaCount = 0,
  children = null,
}) => {
  const [viewingSubmission, setViewingSubmission] = useState(null);

  return (
    <div className="w-full">
      {viewingSubmission ? (
        <ViewTestResult
          viewingSubmission={viewingSubmission}
          setViewingSubmission={setViewingSubmission}
        />
      ) : (
        <ViewList
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
