"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { BackButton } from "@/components/ui/elements";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Type,
  AlignLeft,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";

const CreateRubricPage = () => {
  const params = useParams();
  const router = useRouter();
  const assignment_id = params["assignment-id"];
  const course_id = params["course-id"];

  const { api } = useMetadata();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_points: 10.0,
  });

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });

    const { name, value } = e.target;

    // Cast max_points to Float to match schema
    let finalValue = value;
    if (name === "max_points") finalValue = parseFloat(value) || 0;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // POST to: assignments/<assignment_id>/rubric-criteria/
      await api.post(`assignments/${assignment_id}/rubric-criteria/`, {
        ...formData,
        assignment: assignment_id,
      });

      setStatus({
        type: "success",
        message: "Criterion added! It's now part of the grading rubric.",
      });

      // Reset name and description for quick entry of the next item
      setFormData({
        name: "",
        description: "",
        max_points: 10.0,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail || "Failed to create rubric criterion.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-surface p-8 rounded-md border border-border shadow-subtle"
    >
      {/* Criterion Name (varchar 100) */}
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

      {/* Max Points (FLOAT) */}
      <div className="space-y-2 max-w-xs">
        <label className="text-subheading flex items-center">
          <Award size={16} className="mr-2 text-primary" />
          Weight (Max Points)
        </label>
        <input
          type="number"
          step="0.1"
          name="max_points"
          value={formData.max_points}
          onChange={handleChange}
          className="w-full p-3 bg-background border border-border rounded text-body font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
          min="0"
          required
        />
      </div>

      {/* Description (TEXT) */}
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

      {/* Feedback Section */}
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
              <div className="mt-4 flex space-x-6">
                <button
                  type="button"
                  onClick={() => setStatus({ type: null, message: "" })}
                  className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center text-accent hover:text-primary transition-colors"
                >
                  <PlusCircle size={14} className="mr-1" /> Add Another
                  Criterion
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/app/faculty/${course_id}/assignments/${assignment_id}/rubrics`,
                    )
                  }
                  className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center text-accent hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} className="mr-1" /> View Full Rubric
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`cursor-pointer w-full py-4 bg-primary text-white font-black rounded shadow-subtle hover:bg-accent transition-all uppercase tracking-[0.25em] text-xs ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Saving Criterion..." : "Add to Rubric"}
      </button>
    </form>
  );
};

export default CreateRubricPage;
