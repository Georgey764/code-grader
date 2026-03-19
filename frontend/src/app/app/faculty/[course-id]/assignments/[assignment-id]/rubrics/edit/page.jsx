"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  Save,
  ArrowLeft,
  Trophy,
  Scale,
  Type,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function EditRubricPage() {
  const { api } = useMetadata();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const assignmentId = params["assignment-id"];
  const criteriaId = searchParams.get("criteria_id");

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    max_points: 0,
    weight: 0,
  });

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [assignmentRes, criteriaRes] = await Promise.all([
          api.get(`assignments/${assignmentId}/`),
          api.get(`assignments/${assignmentId}/rubric-criteria/${criteriaId}/`),
        ]);
        setAssignment(assignmentRes.data);
        setFormData({
          name: criteriaRes.data.name,
          max_points: criteriaRes.data.max_points,
          weight: criteriaRes.data.weight || 0,
        });
      } catch (error) {
        console.error("Fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    if (criteriaId) fetchContext();
  }, [criteriaId, assignmentId, api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (!assignment?.is_weighted) payload.weight = 0;

      await api.patch(
        `assignments/${assignmentId}/rubric-criteria/${criteriaId}/`,
        payload,
      );
      setStatus({
        type: "success",
        message: "Criterion updated successfully.",
      });
      setTimeout(
        () =>
          router.push(
            `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics`,
          ),
        1200,
      );
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.detail || "Update failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full" />

        <div className="p-8 md:p-12 space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <h1 className="text-2xl font-black text-accent uppercase tracking-tighter">
              Edit Criterion
            </h1>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs font-black text-text-muted hover:text-accent uppercase tracking-widest flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Cancel
            </button>
          </div>

          <div className="space-y-8">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Type size={16} className="text-secondary" /> Criterion Title
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-4 bg-background border border-border rounded-xl text-lg font-bold text-accent outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Max Grade */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <Trophy size={16} className="text-primary" /> Point Value
                  (Max)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.max_points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_points: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-4 bg-background border border-border rounded-xl text-lg font-black text-accent"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <Scale size={16} className="text-secondary" /> Contribution
                  Weight (%)
                </label>
                <div className="relative">
                  <input
                    required={assignment?.is_weighted}
                    disabled={!assignment?.is_weighted}
                    type="number"
                    step="0.01"
                    value={assignment?.is_weighted ? formData.weight : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full p-4 bg-background border border-border rounded-xl text-lg font-black transition-all ${
                      !assignment?.is_weighted
                        ? "bg-slate-50 opacity-20"
                        : "text-primary"
                    }`}
                  />
                  {assignment?.is_weighted && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-8 border-t border-border space-y-6">
            {status.message && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in ${
                  status.type === "error"
                    ? "bg-red-50 border-red-100 text-error"
                    : "bg-green-50 border-green-100 text-green-700"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p className="text-xs font-black uppercase tracking-widest">
                  {status.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-5 bg-accent text-white font-black rounded-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSaving ? "Syncing Changes..." : "Update Criterion"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
