"use client";

import {
  Loader2,
  Trophy,
  MessageSquare,
  Save,
  Scale,
  Eye,
} from "lucide-react";
import { useMetadata } from "@/context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Rubric criteria editor — use inline on the faculty submission page or inside GradingModal.
 */
export default function RubricGradingForm({
  submission,
  assignmentId,
  /** Shown under the title (e.g. student name) */
  subtitle,
  /** Optional class on outer wrapper */
  className = "",
  onSaved,
}) {
  const { api } = useMetadata();
  const router = useRouter();

  const [criteria, setCriteria] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    const fetchGradingData = async () => {
      try {
        const [assignmentRes, criteriaRes, submissionRes] = await Promise.all([
          api.get(`assignments/${assignmentId}/`),
          api.get(`assignments/${assignmentId}/rubric-criteria/`),
          api.get(`assessments/submissions/${submission.id}/`),
        ]);

        const assignmentData = assignmentRes.data;
        const criteriaList = criteriaRes.data;
        const existingResults = submissionRes.data?.rubric_results || [];

        const resultsMap = {};
        existingResults.forEach((res) => {
          resultsMap[res.rubric_criteria] = res;
        });

        const initialGrades = {};
        criteriaList.forEach((c) => {
          const match = resultsMap[c.id];
          initialGrades[c.id] = {
            result_id: match?.id ?? null,
            points: match?.points != null ? parseFloat(match.points) : 0.0,
            optional_feedback: match?.optional_feedback ?? "",
            dirty: !!match?.id,
          };
        });

        setAssignment(assignmentData);
        setCriteria(criteriaList);
        setGrades(initialGrades);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (submission?.id) fetchGradingData();
  }, [api, assignmentId, submission.id]);

  const handlePointChange = (cid, value, max) => {
    let val = parseFloat(value);
    if (isNaN(val)) val = 0;
    if (val > max) val = max;
    if (val < 0) val = 0;

    setGrades((prev) => ({
      ...prev,
      [cid]: { ...prev[cid], points: val, dirty: true },
    }));
  };

  const submitGrades = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(grades).map(([cid, data]) => {
          const payload = {
            submission: submission.id,
            rubric_criteria: cid,
            points: data.points,
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
      alert("Grades saved.");
      onSaved?.();
      router.refresh();
    } catch (err) {
      console.log(err);
      console.log(err?.response);
      alert("Synchronization failed. Check console for model constraints.");
    } finally {
      setSaving(false);
    }
  };

  const totalPts = Object.values(grades).reduce(
    (acc, curr) => acc + Number(curr.points) || 0,
    0,
  );

  return (
    <div
      className={`flex flex-col bg-white border border-border rounded-2xl shadow-subtle overflow-hidden ${className}`}
    >
      <header className="flex-shrink-0 p-5 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent text-white rounded-xl shadow-md">
            <Trophy size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-accent">
              Rubric grading
            </h3>
            {subtitle ? (
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`../assignments/${assignmentId}/rubrics`)}
          className="cursor-pointer py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-primary transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Eye size={16} /> View rubrics
        </button>
      </header>

      <div className="overflow-y-auto p-5 sm:p-6 space-y-8 bg-slate-50/30 max-h-[min(60vh,520px)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">
              Loading rubric…
            </p>
          </div>
        ) : criteria.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">
            No rubric criteria for this assignment.
          </p>
        ) : (
          criteria.map((c) => (
            <div
              key={c.id}
              className="group animate-in fade-in slide-in-from-top-2 border border-border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-accent uppercase tracking-tight">
                    {c.name}
                  </h4>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                    <Scale size={12} className="text-secondary" /> Weight:{" "}
                    {assignment?.is_weighted ? `${c.weight}%` : "Not weighted"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max={c.max_points}
                      value={grades[c.id]?.points ?? 0}
                      onChange={(e) =>
                        handlePointChange(c.id, e.target.value, c.max_points)
                      }
                      className="w-24 p-2.5 bg-white border border-border rounded-lg text-center font-black text-accent text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all outline-none"
                    />
                    <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded font-bold uppercase">
                      Pts
                    </span>
                  </div>
                  <span className="text-xs font-black text-text-muted/50 uppercase">
                    / {c.max_points}
                  </span>
                </div>
              </div>

              <div className="relative group/feedback">
                <MessageSquare
                  size={14}
                  className="absolute left-3 top-3 text-text-muted/30 group-focus-within/feedback:text-accent transition-colors"
                />
                <textarea
                  placeholder="Feedback for this criterion (optional)…"
                  value={grades[c.id]?.optional_feedback ?? ""}
                  onChange={(e) =>
                    setGrades((prev) => ({
                      ...prev,
                      [c.id]: {
                        ...prev[c.id],
                        optional_feedback: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-3 pl-9 bg-slate-50 border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-accent/5 focus:border-accent/30 transition-all min-h-[80px] resize-none"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="flex-shrink-0 p-5 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">
            Total (this submission)
          </span>
          <span className="text-lg font-black text-accent">
            {totalPts.toFixed(1)}{" "}
            <span className="text-xs text-text-muted font-bold">pts</span>
          </span>
        </div>

        <button
          type="button"
          onClick={submitGrades}
          disabled={saving || loading || criteria.length === 0}
          className="w-full sm:w-auto px-8 py-3.5 bg-accent text-white font-black rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving…" : "Save grades"}
        </button>
      </footer>
    </div>
  );
}
