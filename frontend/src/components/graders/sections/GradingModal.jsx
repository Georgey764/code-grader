"use client";

import {
  Loader2,
  Trophy,
  X,
  MessageSquare,
  Save,
  Scale,
  Eye,
} from "lucide-react";
import { useMetadata } from "@/context";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function GradingModal({ submission, assignmentId, onClose }) {
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

        const assignment = assignmentRes.data;
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

        setAssignment(assignment);
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
      alert("Grades submitted successfully.");
      onClose();
      router.refresh();
    } catch (err) {
      console.log(err);
      console.log(err?.response);
      alert("Synchronization failed. Check console for model constraints.");
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-white w-full max-w-3xl flex flex-col rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
        style={{ maxHeight: "90vh" }}
      >
        {/* FIXED HEADER */}
        <header className="flex-shrink-0 p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent text-white rounded-2xl shadow-lg">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-accent">
                Rubric Evaluator
              </h3>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Entity:{" "}
                {submission?.student_detail?.full_name ||
                  "ID: " + submission.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push(`../assignments/${assignmentId}/rubrics`)
              }
              className="cursor-pointer py-2 px-4 hover:bg-accent/80 rounded text-slate-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-accent text-white"
            >
              <Eye size={20} /> View Rubrics
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div
          className="overflow-y-auto p-8 space-y-12 bg-slate-50/20 custom-scrollbar"
          style={{ maxHeight: "calc(90vh - 160px)" }}
        >
          {loading ? (
            <div
              key="loading"
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">
                Loading Model Data...
              </p>
            </div>
          ) : (
            criteria.map((c) => (
              <div
                key={c.id}
                className="group animate-in fade-in slide-in-from-top-2 mb-4"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-accent uppercase tracking-tight">
                      {c.name}
                    </h4>

                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                      <Scale size={12} className="text-secondary" /> Weight:{" "}
                      {assignment?.is_weighted
                        ? `${c.weight}%`
                        : "Not Weighted"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max={c.max_points}
                        value={grades[c.id].points}
                        onChange={(e) =>
                          handlePointChange(c.id, e.target.value, c.max_points)
                        }
                        className="w-24 p-3 bg-white border border-border rounded-xl text-center font-black text-accent text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all outline-none"
                      />
                      <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded font-bold uppercase">
                        Points
                      </span>
                    </div>
                    <span className="text-xs font-black text-text-muted/40 uppercase">
                      / {c.max_points}
                    </span>
                  </div>
                </div>

                <div className="relative group/feedback">
                  <MessageSquare
                    size={14}
                    className="absolute left-4 top-4 text-text-muted/30 group-focus-within/feedback:text-accent transition-colors"
                  />
                  <textarea
                    placeholder="Enter qualitative feedback for this criterion..."
                    value={grades[c.id].optional_feedback}
                    onChange={(e) =>
                      setGrades((prev) => ({
                        ...prev,
                        [c.id]: {
                          ...prev[c.id],
                          optional_feedback: e.target.value,
                        },
                      }))
                    }
                    className="w-full p-4 pl-10 bg-white border border-slate-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-accent/5 focus:border-accent/20 transition-all min-h-[90px] resize-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* FIXED FOOTER */}
        <footer className="flex-shrink-0 p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-3xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
              Total Score Progress
            </span>
            <span className="text-lg font-black text-accent mt-1">
              {Object.values(grades)
                .reduce((acc, curr) => acc + Number(curr.points) || 0, 0)
                .toFixed(1)}{" "}
              <span className="text-xs text-text-muted">PTS</span>
            </span>
          </div>

          <button
            onClick={submitGrades}
            disabled={saving || loading}
            className="w-full sm:w-auto px-8 py-4 bg-accent text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-20"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Syncing..." : "Publish Evaluation"}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
