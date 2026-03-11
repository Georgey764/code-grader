"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import { BackButton } from "@/components/ui/elements";
import { LoadingPage } from "@/components/ui/sections";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Type,
  AlignLeft,
  ArrowLeft,
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
    description: "",
    max_points: 10.0,
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
          description: data.description ?? "",
          max_points: parseFloat(data.max_points) ?? 10.0,
        });
      } catch (err) {
        console.error(err.response);
        setStatus({
          type: "error",
          message:
            err.response?.data?.detail || "Failed to load rubric criterion.",
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
    let finalValue = value;
    if (name === "max_points") finalValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rubricCriteriaId || !assignmentId) return;
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
          err.response?.data?.detail ||
          Object.values(err.response?.data || {})
            .flat()
            .join(" ") ||
          "Failed to update rubric criterion.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  if (!rubricCriteriaId) {
    return (
      <div className="mt-6 p-6 bg-surface border border-border rounded-md text-center">
        <AlertCircle className="mx-auto text-error mb-3" size={32} />
        <p className="text-body font-medium">
          Missing <code className="text-accent">rubric_criteria_id</code> query
          parameter.
        </p>
        <p className="text-caption text-text-muted mt-2">
          Open this page from the rubric list using the edit action on a
          criterion.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-8 bg-surface p-8 rounded-md border border-border shadow-subtle"
      >
        <div className="space-y-2">
          <label className="text-subheading flex items-center">
            <Type size={16} className="mr-2 text-secondary" />
            Criterion Name
          </label>
          <input
            type="text"
            name="name"
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded text-body focus:ring-2 focus:ring-secondary outline-none transition-all"
            placeholder="e.g., Code Readability or Logic Implementation"
            required
          />
          <p className="text-[10px] text-text-muted">
            Brief title for this grading category (Max 100 chars).
          </p>
        </div>

        <div className="space-y-2 max-w-xs">
          <label className="text-subheading flex items-center">
            <Award size={16} className="mr-2 text-primary" />
            Weight (Max Points)
          </label>
          <input
            type="number"
            step="1"
            name="max_points"
            value={formData.max_points}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded text-body font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
            min="0"
            required
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-border/50">
          <label className="text-subheading flex items-center">
            <AlignLeft size={16} className="mr-2 text-secondary" />
            Grading Instructions / Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full min-h-[150px] p-4 bg-background border border-border rounded text-body leading-relaxed focus:ring-2 focus:ring-secondary outline-none resize-y"
            placeholder="Describe what a student must achieve to earn full marks in this category..."
            required
          />
          <p className="text-[10px] text-text-muted italic">
            This description helps students understand expectations and assists
            graders in consistency.
          </p>
        </div>

        {status.message && (
          <div
            className={`p-4 rounded flex items-start space-x-3 border ${
              status.type === "error"
                ? "bg-red-50 border-red-200 text-error"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {status.type === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <div className="flex-1">
              <p className="text-sm font-bold">
                {status.type === "error" ? "Error" : "Success"}
              </p>
              <p className="text-xs">{status.message}</p>
              {status.type === "success" && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics`,
                      )
                    }
                    className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center text-accent hover:text-primary transition-colors"
                  >
                    <ArrowLeft size={14} className="mr-1" /> Back to Rubric
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`cursor-pointer w-full py-4 bg-primary text-white font-black rounded shadow-subtle hover:bg-accent transition-all uppercase tracking-[0.25em] text-xs ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving..." : "Update Criterion"}
        </button>
      </form>
    </div>
  );
}
