"use client";

import { Loader2, Trophy, X, Check, Info } from "lucide-react";
import { useMetadata } from "@/context";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// 1. Import useRouter
import { useRouter } from "next/navigation";

export default function GradingModal({
  submission,
  assignmentId,
  onClose,
  rosterId,
}) {
  const { api } = useMetadata();
  // 2. Initialize router
  const router = useRouter();

  const [criteria, setCriteria] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const levels = [
    { value: 1, key: "desc_one", label: "Beginning" },
    { value: 2, key: "desc_two", label: "Developing" },
    { value: 3, key: "desc_three", label: "Proficient" },
    { value: 4, key: "desc_four", label: "Accomplished" },
    { value: 5, key: "desc_five", label: "Exceptional" },
  ];

  useEffect(() => {
    const fetchGradingData = async () => {
      try {
        const [criteriaRes, submissionRes] = await Promise.all([
          api.get(`assignments/${assignmentId}/rubric-criteria/`),
          api.get(`assessments/submissions/${submission.id}/`),
        ]);

        const criteriaList = criteriaRes.data;
        const freshSubmissionData = submissionRes.data;
        const existingResults = freshSubmissionData?.rubric_results || [];

        const resultsMap = {};
        existingResults.forEach((res) => {
          const cid = res.rubric_criteria_id || res.rubric_criteria;
          if (cid) {
            resultsMap[cid] = res;
          }
        });

        const initialGrades = {};
        criteriaList.forEach((c) => {
          const match = resultsMap[c.id];
          initialGrades[c.id] = {
            result_id: match?.id || null,
            points: match?.points ? parseInt(match.points) : null,
            optional_feedback: match?.optional_feedback ?? "",
          };
        });

        setCriteria(criteriaList);
        setGrades(initialGrades);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (submission?.id) fetchGradingData();
  }, [api, assignmentId, submission.id]);

  const handleSelectLevel = (criteriaId, value) => {
    setGrades((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], points: value },
    }));
  };

  const handleFeedbackUpdate = (criteriaId, text) => {
    setGrades((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], optional_feedback: text },
    }));
  };

  const submitGrades = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(grades).map(([cid, data]) => {
          if (data.points === null) return Promise.resolve();

          const payload = {
            submission: submission.id,
            rubric_criteria: cid,
            points: parseInt(data.points),
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

      // 3. Close the modal and refresh the page data
      onClose();
      window.location.href = `./grades`;
    } catch (err) {
      console.log(err?.response?.data);
      alert("Failed to save. Check your connection or field constraints.");
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-white w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <header className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Trophy size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-accent">
                Rubric Evaluation
              </h3>
              <p className="text-[10px] font-bold text-text-muted uppercase">
                Attempt Result for{" "}
                {submission?.student_profile?.user?.first_name || "Student"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4 sm:p-8 bg-slate-50/30 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">
                Hydrating Rubric Results...
              </p>
            </div>
          ) : (
            criteria.map((c) => (
              <div key={c.id} className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <div>
                    <h4 className="font-black text-accent text-xs uppercase">
                      {c.name}
                    </h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase">
                      Weight: {c.weight}%
                    </p>
                  </div>
                  {grades[c.id]?.points && (
                    <div className="px-2 py-1 bg-green-50 rounded border border-green-100 animate-in fade-in zoom-in">
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">
                        Level {grades[c.id].points} Selected
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {levels.map((lvl) => {
                    const isSelected = grades[c.id]?.points === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        onClick={() => handleSelectLevel(c.id, lvl.value)}
                        className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                          isSelected
                            ? "bg-accent border-accent text-white shadow-lg"
                            : "bg-white border-slate-200 hover:border-accent/40"
                        }`}
                      >
                        <div className="flex justify-between items-center border-b pb-2 border-current/10 text-[9px] font-black uppercase">
                          <span>{lvl.label}</span>
                          {isSelected && <Check size={14} />}
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed ${isSelected ? "text-white" : "text-text-muted"}`}
                        >
                          {c[lvl.key] || (
                            <span className="opacity-30 italic text-[10px]">
                              Criteria detail missing.
                            </span>
                          )}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-300">
                    <Info size={14} />
                  </div>
                  <textarea
                    placeholder="Provide context for this score..."
                    value={grades[c.id]?.optional_feedback || ""}
                    onChange={(e) => handleFeedbackUpdate(c.id, e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-accent resize-none min-h-[44px]"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="p-6 bg-white border-t border-slate-100 flex justify-between items-center gap-4">
          <div className="text-[10px] font-black text-text-muted uppercase">
            {Object.values(grades).filter((g) => g.points !== null).length} of{" "}
            {criteria.length} Criteria Filled
          </div>
          <button
            onClick={submitGrades}
            disabled={
              saving ||
              loading ||
              Object.values(grades).some((g) => g.points === null)
            }
            className="px-12 py-4 bg-accent text-white font-black uppercase text-xs tracking-widest rounded-xl hover:brightness-110 disabled:opacity-20 transition-all shadow-xl"
          >
            {saving ? "Syncing..." : "Update Evaluation"}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
