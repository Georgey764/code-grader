"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  CheckCircle2,
  AlertCircle,
  Type,
  PlusCircle,
  ArrowLeft,
  Layers,
  Scale,
} from "lucide-react";

const CreateRubricPage = () => {
  const params = useParams();
  const router = useRouter();
  const assignment_id = params["assignment-id"];
  const course_id = params["course-id"];

  const { api } = useMetadata();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
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
    const fetchAssignment = async () => {
      try {
        const res = await api.get(`assignments/${assignment_id}/`);
        setAssignment(res.data);
      } catch (err) {
        console.error("Failed to load assignment for rubric", err);
      }
    };

    fetchAssignment();
  }, [api, assignment_id]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value } = e.target;

    // When assignment is not weighted, ignore changes to the weight field
    if (name === "weight" && assignment && !assignment.is_weighted) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "weight" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const payload = {
        ...formData,
        assignment: assignment_id,
      };

      // If assignment is not weighted, force weight to null
      if (assignment && !assignment.is_weighted) {
        payload.weight = null;
      }

      await api.post(`assignments/${assignment_id}/rubric-criteria/`, payload);

      setStatus({
        type: "success",
        message: "Criterion added successfully!",
      });

      setFormData({
        name: "",
        weight: 20.0,
        desc_one: "",
        desc_two: "",
        desc_three: "",
        desc_four: "",
        desc_five: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "Failed to create criterion. Sum of weights cannot exceed 100%",
      });
    } finally {
      setLoading(false);
    }
  };

  const levelLabels = [
    { id: "desc_one", title: "Level 1", sub: "Beginning" },
    { id: "desc_two", title: "Level 2", sub: "Developing" },
    { id: "desc_three", title: "Level 3", sub: "Proficient" },
    { id: "desc_four", title: "Level 4", sub: "Accomplished" },
    { id: "desc_five", title: "Level 5", sub: "Exceptional" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-8 px-4">
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* --- Header & Weight Card --- */}
        <div className="bg-surface p-5 md:p-8 rounded-xl border border-border shadow-subtle flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center">
              <Type size={14} className="mr-2 text-secondary" />
              Criterion Name
            </label>
            <input
              type="text"
              name="name"
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 md:p-4 bg-background border border-border rounded-lg text-base md:text-lg font-bold text-accent outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
              placeholder="e.g., Logical Flow"
              required
            />
          </div>

          <div className="w-full md:w-56 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center">
              <Scale size={14} className="mr-2 text-primary" />
              Weight (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                name="weight"
                value={
                  assignment && !assignment.is_weighted ? "" : formData.weight
                }
                onChange={handleChange}
                className="w-full p-3 md:p-4 bg-background border border-border rounded-lg text-base md:text-lg font-black text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                min="0"
                max="100"
                required={!!(assignment && assignment.is_weighted)}
                disabled={assignment && !assignment.is_weighted}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">
                %
              </span>
            </div>
            {assignment && !assignment.is_weighted && (
              <p className="text-[10px] text-text-muted mt-1">
                This assignment is <span className="font-bold">unweighted</span>;
                weights are ignored and stored as <span className="font-mono">null</span>.
              </p>
            )}
          </div>
        </div>

        {/* --- Performance Grid --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Layers size={18} className="text-secondary" />
            <h3 className="text-sm font-black text-accent uppercase tracking-widest">
              Performance Levels
            </h3>
          </div>

          {/* Responsive Grid: 1 col on mobile, 5 on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {levelLabels.map((level) => (
              <div
                key={level.id}
                className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm space-y-3 md:space-y-4 flex flex-col"
              >
                <div className="border-b border-border pb-2 flex justify-between lg:block">
                  <p className="text-[10px] font-black text-accent uppercase">
                    {level.title}
                  </p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                    {level.sub}
                  </p>
                </div>
                <textarea
                  name={level.id}
                  value={formData[level.id]}
                  onChange={handleChange}
                  className="w-full flex-1 min-h-[120px] md:min-h-[160px] bg-transparent text-xs leading-relaxed outline-none resize-none text-text-main placeholder:text-text-muted/30"
                  placeholder={`Requirements for ${level.sub}...`}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- Footer & Submission --- */}
        <div className="space-y-6">
          {status.message && (
            <div
              className={`p-4 rounded-lg flex items-start space-x-3 border animate-in fade-in slide-in-from-bottom-2 ${
                status.type === "error"
                  ? "bg-red-50 border-red-200 text-error"
                  : "bg-green-50 border-green-200 text-green-800"
              }`}
            >
              {status.type === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {status.message}
                </p>
                {status.type === "success" && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => setStatus({ type: null, message: "" })}
                      className="text-[10px] font-black uppercase tracking-widest flex items-center text-accent hover:underline"
                    >
                      <PlusCircle size={14} className="mr-1" /> Add Next
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/app/faculty/${course_id}/assignments/${assignment_id}/rubrics`,
                        )
                      }
                      className="text-[10px] font-black uppercase tracking-widest flex items-center text-accent hover:underline"
                    >
                      <ArrowLeft size={14} className="mr-1" /> Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 md:py-5 bg-primary text-white font-black rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add to Rubric"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRubricPage;
