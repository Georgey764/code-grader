"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Type,
  AlignLeft,
  ArrowLeft,
  Layers,
} from "lucide-react";

export default function EditRubricPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const assignmentId = params["assignment-id"];
  const courseId = params["course-id"];
  const rubricCriteriaId = searchParams.get("rubric_criteria_id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    weight: 20.0,
    desc_one: "",
    desc_two: "",
    desc_three: "",
    desc_four: "",
    desc_five: "",
  });

  useEffect(() => {
    if (!rubricCriteriaId || !assignmentId) {
      setLoading(false);
      return;
    }
    const fetchCriterion = async () => {
      try {
        const response = await api.get(
          `assignments/${assignmentId}/rubric-criteria/${rubricCriteriaId}/`,
        );
        const data = response.data;
        setFormData({
          name: data.name ?? "",
          weight: parseFloat(data.weight) ?? 20.0,
          desc_one: data.desc_one ?? "",
          desc_two: data.desc_two ?? "",
          desc_three: data.desc_three ?? "",
          desc_four: data.desc_four ?? "",
          desc_five: data.desc_five ?? "",
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: "Failed to load rubric criterion.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCriterion();
  }, [assignmentId, rubricCriteriaId, api]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "weight" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      await api.patch(
        `assignments/${assignmentId}/rubric-criteria/${rubricCriteriaId}/`,
        formData,
      );
      setStatus({
        type: "success",
        message: "Criterion updated successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail || "Update failed. Check your inputs.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- Top Metadata Card --- */}
        <div className="bg-surface p-8 rounded-xl border border-border shadow-subtle space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center">
                <Type size={14} className="mr-2 text-secondary" />
                Criterion Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 bg-background border border-border rounded-lg text-lg font-bold text-accent outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                placeholder="e.g., Technical Implementation"
                required
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center">
                <Award size={14} className="mr-2 text-primary" />
                Weight (%)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full p-4 bg-background border border-border rounded-lg text-lg font-black text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>

        {/* --- Performance Levels Grid --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Layers size={18} className="text-secondary" />
            <h3 className="text-sm font-black text-accent uppercase tracking-widest">
              Performance Progression
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { id: "desc_one", label: "Level 1", sub: "Beginning" },
              { id: "desc_two", label: "Level 2", sub: "Developing" },
              { id: "desc_three", label: "Level 3", sub: "Proficient" },
              { id: "desc_four", label: "Level 4", sub: "Accomplished" },
              { id: "desc_five", label: "Level 5", sub: "Exceptional" },
            ].map((level, idx) => (
              <div
                key={level.id}
                className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-[10px] font-black text-accent uppercase tracking-tighter">
                    {level.label}
                  </span>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                    {level.sub}
                  </span>
                </div>
                <textarea
                  name={level.id}
                  value={formData[level.id]}
                  onChange={handleChange}
                  placeholder="Describe level requirements..."
                  className="flex-1 w-full min-h-[120px] bg-transparent text-xs leading-relaxed outline-none resize-none text-text-main placeholder:text-text-muted/50"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- Status & Actions --- */}
        <div className="space-y-4">
          {status.message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                status.type === "error"
                  ? "bg-error/5 border-error/20 text-error"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {status.type === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span className="text-xs font-bold">{status.message}</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics`,
                )
              }
              className="px-6 py-4 border border-border rounded-lg text-xs font-black uppercase tracking-widest text-text-muted hover:bg-background transition-all flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-accent text-white font-black rounded-lg shadow-lg hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-xs"
            >
              {saving ? "Saving Changes..." : "Update Criterion"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
