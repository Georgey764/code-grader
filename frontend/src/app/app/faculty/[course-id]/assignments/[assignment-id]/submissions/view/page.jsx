"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {} from "lucide-react";
import { useMetadata } from "@/context";
import { createPortal } from "react-dom";
import {
  Hash,
  InboxIcon,
  Calendar,
  FileText,
  Download,
  ChevronRight,
  FileCode,
  FileDown,
  ClipboardCheck,
  X,
  Save,
  Trophy,
  MessageSquare,
  Loader2,
} from "lucide-react";
import ResultsView from "./(helper)/ResultsView";

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
  const [viewingResults, setViewingResults] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        let url_call = `assessments/submissions/?assignment_id=${assignmentId}`;
        if (rosterId) url_call += `&roster_id=${rosterId}`;
        if (groupId) url_call += `&group_id=${groupId}`;

        const [subRes, assignRes] = await Promise.all([
          api.get(url_call),
          api.get(`assignments/${assignmentId}/`),
        ]);

        setSubmissions([...subRes?.data].reverse());
        setAssignmentData(assignRes?.data);
      } catch (err) {
        console.error("Error fetching page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [api, assignmentId, groupId, rosterId]);

  if (viewingResults) {
    return (
      <div className="px-4 sm:px-8 space-y-6">
        <ResultsView results={viewingResults}>
          <button
            onClick={() => setViewingResults(null)}
            className="cursor-pointer w-full sm:w-auto px-4 py-2 border-2 border-primary text-primary font-black uppercase text-[10px] tracking-widest rounded hover:bg-primary hover:text-white transition-all"
          >
            Back to History
          </button>
        </ResultsView>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 pb-12 animate-in fade-in duration-500 space-y-8">
      {submissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <div className="md:hidden space-y-4">
            {submissions.map((sub, index) => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                index={submissions.length - index}
                isLatest={index === 0}
                rubricCriteriaCount={
                  assignmentData?.rubric_criterias?.length || 0
                }
                onViewResults={setViewingResults}
                onGrade={setGradingSubmission}
              />
            ))}
          </div>

          <div className="hidden md:block bg-surface border border-border rounded-xl overflow-hidden shadow-subtle">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] w-24">
                    Attempt
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] w-40">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right w-80">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {submissions.map((sub, index) => (
                  <SubmissionRow
                    key={sub.id}
                    sub={sub}
                    index={submissions.length - index}
                    isLatest={index === 0}
                    rubricCriteriaCount={
                      assignmentData?.rubric_criterias?.length || 0
                    }
                    onViewResults={setViewingResults}
                    onGrade={setGradingSubmission}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gradingSubmission && (
        <GradingModal
          submission={gradingSubmission}
          assignmentId={assignmentId}
          onClose={() => setGradingSubmission(null)}
        />
      )}
    </div>
  );
}

/** * --- Component: Grading Logic Helper --- */
function getGradingInfo(sub, rubricCriteriaCount) {
  const gradedCount = sub?.rubric_results?.length || 0;

  if (rubricCriteriaCount === 0)
    return { label: "No Rubric", color: "text-slate-400" };
  if (gradedCount === 0) return { label: "Ungraded", color: "text-error" };
  if (gradedCount < rubricCriteriaCount)
    return {
      label: `Partial (${gradedCount}/${rubricCriteriaCount})`,
      color: "text-secondary",
    };
  return { label: "Fully Graded", color: "text-green-600" };
}

/** * --- Sub-Components: Row & Card --- */
function SubmissionRow({
  sub,
  index,
  isLatest,
  rubricCriteriaCount,
  onViewResults,
  onGrade,
}) {
  const grading = getGradingInfo(sub, rubricCriteriaCount);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4 font-black text-accent text-sm">
        <Hash size={14} className="inline mr-2 text-secondary" />
        {index}
        {isLatest && (
          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/40 text-[9px] font-black uppercase tracking-widest text-secondary">
            Latest
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-xs font-bold text-accent">
        <div className="flex flex-col gap-1">
          <span>
            <Calendar size={14} className="inline mr-2 text-primary" />
            {new Date(sub.created_at).toLocaleString()}
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-widest ${grading.color}`}
          >
            {grading.label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={sub.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <ActionButton
            onClick={() => onGrade(sub)}
            icon={<ClipboardCheck size={14} />}
            label="Grade"
          />
          {sub.submitted_file && (
            <a
              href={sub.submitted_file}
              download
              target="_blank"
              className="text-text-muted hover:text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <FileDown size={14} /> File
            </a>
          )}
          <button
            onClick={() => onViewResults(sub.test_results)}
            className="text-primary hover:text-accent text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
          >
            View Results <ChevronRight size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function SubmissionCard({
  sub,
  index,
  isLatest,
  rubricCriteriaCount,
  onViewResults,
  onGrade,
}) {
  const grading = getGradingInfo(sub, rubricCriteriaCount);

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-black text-accent text-xs uppercase tracking-widest">
          Attempt {index}
          {isLatest && (
            <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/40 text-[9px] font-black uppercase tracking-widest text-secondary">
              Latest
            </span>
          )}
        </span>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={sub.status} />
          <span
            className={`text-[9px] font-black uppercase tracking-widest ${grading.color}`}
          >
            {grading.label}
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onGrade(sub)}
          className="flex-1 py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
        >
          <ClipboardCheck size={14} /> Grade Attempt
        </button>
        <button
          onClick={() => onViewResults(sub.test_results)}
          className="flex-1 py-3 bg-primary text-white rounded font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
        >
          Results <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function GradingModal({ submission, assignmentId, onClose }) {
  const { api } = useMetadata();
  const [criteria, setCriteria] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGradingData = async () => {
      try {
        const [criteriaRes, submissionRes] = await Promise.all([
          api.get(`assignments/${assignmentId}/rubric-criteria/`),
          api.get(`assessments/submissions/${submission.id}/`),
        ]);

        const criteriaList = criteriaRes.data;
        const existingResults = submissionRes.data?.rubric_results || [];
        const resultsMap = {};
        existingResults.forEach((res) => {
          resultsMap[res.rubric_criteria] = res;
        });

        const initialGrades = {};
        criteriaList.forEach((c) => {
          const existing = resultsMap[c.id];
          initialGrades[c.id] = {
            result_id: existing?.id || null,
            points_awarded: existing?.points_awarded ?? 0,
            optional_feedback: existing?.optional_feedback ?? "",
          };
        });

        setCriteria(criteriaList);
        setGrades(initialGrades);
      } catch (err) {
        console.error("Error initializing grading modal:", err);
      } finally {
        setLoading(false);
      }
    };
    if (submission?.id) fetchGradingData();
  }, [api, assignmentId, submission.id]);

  const handleUpdate = (cid, field, value, max_points) => {
    if (value > max_points) {
      value = max_points;
    }

    setGrades((prev) => ({
      ...prev,
      [cid]: { ...prev[cid], [field]: value },
    }));
  };

  const submitGrades = async () => {
    setSaving(true);
    try {
      const criteriaMaxMap = {};
      criteria.forEach((c) => {
        criteriaMaxMap[c.id] = c.max_points;
      });

      await Promise.all(
        Object.entries(grades).map(([cid, data]) => {
          const maxPoints = criteriaMaxMap[cid] ?? Infinity;
          let points = parseFloat(data.points_awarded) || 0;
          points = Math.max(0, Math.min(points, maxPoints));

          const payload = {
            submission: submission.id,
            rubric_criteria: cid,
            points_awarded: points,
            optional_feedback: data.optional_feedback,
          };

          return data.result_id
            ? api.patch(
                `assessments/rubric-results/${data.result_id}/`,
                payload,
              )
            : api.post("assessments/rubric-results/", payload);
        }),
      );
      alert("Evaluation committed successfully.");
      onClose();
    } catch (err) {
      alert("Sync failed. Ensure points are within valid ranges.");
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0",
      }}
      // On wider screens, center vertically
      className="sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/*
        MODAL SHELL — the 3 rules that make this work:
          1. display:flex + flexDirection:column  → stacks header/body/footer
          2. maxHeight:90vh (inline)              → hard cap, can't be purged
          3. overflow:hidden                      → clips to border-radius
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          zIndex: 10,
          backgroundColor: "white",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          border: "1px solid rgba(226,232,240,1)",
        }}
        className="sm:max-w-2xl rounded-t-2xl sm:rounded-2xl"
      >
        {/* ── HEADER: flexShrink:0 keeps it always visible ── */}
        <header
          style={{ flexShrink: 0 }}
          className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                Grading Interface
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID: {submission?.id?.slice(0, 8) || "LOADING"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-none p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/*
          ── BODY: the scrollable region ──
          flexGrow:1    → takes all remaining space between header and footer
          flexShrink:1  → allows it to shrink when viewport is small
          minHeight:0   → THE CRITICAL FIX: flex children default to
                          min-height:auto which prevents shrinking.
                          Setting 0 allows the browser to actually
                          constrain the height and enable scrolling.
          overflowY:auto → scroll when content overflows
        */}
        <div
          style={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "auto",
            backgroundColor: "rgba(248,250,252,0.5)",
            padding: "1rem",
          }}
          className="sm:p-6"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={36} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Synchronizing Rubrics...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {criteria.map((c) => (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-indigo-600 text-sm uppercase">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                    <span className="flex-none bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600">
                      MAX: {c.max_points}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                        Points
                      </label>
                      <input
                        type="number"
                        value={grades[c.id]?.points_awarded || 0}
                        onChange={(e) =>
                          handleUpdate(
                            c.id,
                            "points_awarded",
                            e.target.value,
                            c.max_points,
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                        Feedback
                      </label>
                      <input
                        type="text"
                        placeholder="Critique..."
                        value={grades[c.id]?.optional_feedback || ""}
                        onChange={(e) =>
                          handleUpdate(
                            c.id,
                            "optional_feedback",
                            e.target.value,
                            c.max_points,
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER: flexShrink:0 keeps it always visible ── */}
        <footer
          style={{ flexShrink: 0 }}
          className="p-4 sm:p-6 bg-white border-t border-slate-100"
        >
          <button
            onClick={submitGrades}
            disabled={saving || loading}
            className="w-full py-3.5 sm:py-4 bg-slate-900 bg-primary text-white font-black uppercase text-xs tracking-[0.3em] rounded-xl hover:bg-indigo-600 disabled:opacity-30 transition-all"
          >
            {saving ? "Processing..." : "Commit Evaluation"}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function ActionButton({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-accent font-black uppercase text-[9px] tracking-widest rounded hover:brightness-110 transition-all"
    >
      {icon} {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    COMPLETE: "bg-green-50 text-green-700 border-green-200",
    PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
    INCOMPLETE: "bg-red-50 text-error border-error/20",
    PENDING: "bg-secondary/10 text-secondary border-secondary/20 font-black",
  };
  const style =
    styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border ${style}`}
    >
      <span className="w-1 h-1 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl">
      <InboxIcon size={48} className="text-text-muted mb-4 opacity-40" />
      <h3 className="text-sm font-black text-accent uppercase tracking-widest">
        No Activity
      </h3>
    </div>
  );
}
