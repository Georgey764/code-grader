"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  CheckCircle2,
  AlertCircle,
  Type,
  PlusCircle,
  ArrowLeft,
  Scale,
  Trophy,
  Loader2,
  Trash2,
  GripVertical,
} from "lucide-react";

export default function CreateRubricPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params["assignment-id"];
  const courseId = params["course-id"];
  const { api } = useMetadata();

  const [assignment, setAssignment] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // --- Multi-Form State ---
  const [criteriaList, setCriteriaList] = useState([
    { name: "", max_points: 20.0, weight: 20.0 },
  ]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await api.get(`assignments/${assignmentId}/`);
        setAssignment(res.data);
      } catch (err) {
        console.error("Failed to load context", err);
      } finally {
        setLoadingContext(false);
      }
    };
    fetchAssignment();
  }, [api, assignmentId]);

  // --- Handlers ---
  const addCriterion = () => {
    setCriteriaList([
      ...criteriaList,
      { name: "", max_points: 20.0, weight: 20.0 },
    ]);
  };

  const removeCriterion = (index) => {
    if (criteriaList.length === 1) return;
    const newList = [...criteriaList];
    newList.splice(index, 1);
    setCriteriaList(newList);
  };

  const updateCriterion = (index, field, value) => {
    const newList = [...criteriaList];
    newList[index][field] = field === "name" ? value : parseFloat(value) || 0;
    setCriteriaList(newList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    let successCount = 0;

    try {
      // Process one by one as requested
      for (const criterion of criteriaList) {
        const payload = {
          ...criterion,
          assignment: assignmentId,
        };
        // Force weight to 0 if model is unweighted
        if (assignment && !assignment.is_weighted) payload.weight = 0;

        await api.post(`assignments/${assignmentId}/rubric-criteria/`, payload);
        successCount++;
      }

      setStatus({
        type: "success",
        message: `Successfully registered ${successCount} criteria to the assignment.`,
      });
      // Reset to one empty form
      setCriteriaList([{ name: "", max_points: 20.0, weight: 20.0 }]);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "Batch synchronization failed. Check your weights. Sum of new weights and existing weights must not exceed 100.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingContext) return <LoadingPage />;

  const totalWeight = criteriaList.reduce(
    (acc, curr) => acc + (curr.weight || 0),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-8 mb-10 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-accent uppercase tracking-tighter leading-none">
            Rubric Builder: {assignment?.name}
          </h1>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
            {assignment?.is_weighted
              ? "Weighted Distribution Mode"
              : "Simple Points Mode"}
          </p>
        </div>

        {assignment?.is_weighted && (
          <div className="text-right">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
              Total Weight Allocated
            </p>
            <p
              className={`text-2xl font-black tabular-nums ${totalWeight > 100 ? "text-error" : "text-primary"}`}
            >
              {totalWeight.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- DYNAMIC CRITERIA LIST --- */}
        <div className="space-y-4">
          {criteriaList.map((item, index) => (
            <div
              key={index}
              className="group relative bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all animate-in zoom-in-95 duration-300"
            >
              {/* Delete Button */}
              {criteriaList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  className="absolute top-4 right-4 p-2 text-text-muted hover:text-error transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-end">
                {/* Name */}
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Type size={14} className="text-secondary" /> Criterion{" "}
                    {index + 1} Title
                  </label>
                  <input
                    required
                    value={item.name}
                    onChange={(e) =>
                      updateCriterion(index, "name", e.target.value)
                    }
                    placeholder="e.g., Algorithm Efficiency"
                    className="w-full p-3 bg-background border border-border rounded-xl font-bold text-accent outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Max Grade */}
                <div className="lg:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Trophy size={14} className="text-primary" /> Max Points
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={item.max_points}
                    onChange={(e) =>
                      updateCriterion(index, "max_points", e.target.value)
                    }
                    className="w-full p-3 bg-background border border-border rounded-xl font-black text-accent outline-none"
                  />
                </div>

                {/* Weight */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Scale size={14} className="text-secondary" /> Weight (%)
                  </label>
                  <div className="relative">
                    <input
                      required={assignment?.is_weighted}
                      disabled={!assignment?.is_weighted}
                      type="number"
                      step="0.01"
                      value={assignment?.is_weighted ? item.weight : ""}
                      onChange={(e) =>
                        updateCriterion(index, "weight", e.target.value)
                      }
                      className={`w-full p-3 bg-background border border-border rounded-xl font-black outline-none transition-all ${
                        !assignment?.is_weighted
                          ? "bg-slate-50 opacity-30 cursor-not-allowed"
                          : "text-primary"
                      }`}
                    />
                    {assignment?.is_weighted && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted">
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- ADD ANOTHER BUTTON --- */}
        <button
          type="button"
          onClick={addCriterion}
          className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group"
        >
          <PlusCircle
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-xs font-black uppercase tracking-widest">
            Add Another Criterion
          </span>
        </button>

        {/* --- SUBMISSION & STATUS --- */}
        <div className="pt-10 space-y-6">
          {status.message && (
            <div
              className={`p-5 rounded-2xl flex items-start gap-4 border animate-in slide-in-from-top-2 ${
                status.type === "error"
                  ? "bg-red-50 border-red-100 text-error"
                  : "bg-green-50 border-green-100 text-green-700"
              }`}
            >
              {status.type === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-widest">
                  {status.message}
                </p>
                {status.type === "success" && (
                  <button
                    type="button"
                    onClick={() => router.push(`./`)}
                    className="mt-3 text-xs font-black uppercase underline underline-offset-4 flex items-center gap-2"
                  >
                    <ArrowLeft size={14} /> Return to Rubric List
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {isSubmitting
              ? "Processing Batch..."
              : `Register Rubric (${criteriaList.length} Items)`}
          </button>
        </div>
      </form>
    </div>
  );
}
