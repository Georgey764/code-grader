"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  EyeOff,
  CornerDownRight,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";

const CreateTestCase = () => {
  const params = useParams();
  const router = useRouter();
  const assignment_id = params["assignment-id"];
  const course_id = params["course-id"];

  const { api } = useMetadata();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    input_text: "",
    expected_output: "",
    time_limit: 1000,
    is_hidden: false,
    points_possible: 10,
  });

  const handleChange = (e) => {
    // Clear status when user starts editing again
    if (status.type) setStatus({ type: null, message: "" });

    const { name, value, type, checked } = e.target;

    let finalValue = value;
    if (type === "checkbox") finalValue = checked;
    if (name === "time_limit") finalValue = parseInt(value) || 0;
    if (name === "points_possible") finalValue = parseFloat(value) || 0;

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
      // payload matches the schema: id, assignment_id, input, expected_output, time_limit, is_hidden, points
      await api.post(`assignments/${assignment_id}/test-cases/`, {
        ...formData,
        assignment: assignment_id, // Ensure relationship is linked
      });

      setStatus({
        type: "success",
        message:
          "Test case created successfully! It is now active for this assignment.",
      });

      // Optional: Clear form for next entry
      setFormData({
        input_text: "",
        expected_output: "",
        time_limit: 1000,
        is_hidden: false,
        points_possible: 10,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "Failed to create test case. Please check your inputs.",
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
      {/* Input & Output Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-subheading flex items-center">
            <CornerDownRight size={16} className="mr-2 text-secondary" />
            Standard Input
          </label>
          <textarea
            name="input_text"
            value={formData.input_text}
            onChange={handleChange}
            className="text-white code-block w-full min-h-[120px] focus:ring-2 focus:ring-secondary outline-none resize-y"
            placeholder="e.g. 5\n10"
            required
          />
          <p className="text-[10px] text-text-muted italic">
            The input provided to the student&rsquo;s program via stdin.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-subheading flex items-center">
            <CornerDownRight size={16} className="mr-2 text-secondary" />
            Expected Output
          </label>
          <textarea
            name="expected_output"
            value={formData.expected_output}
            onChange={handleChange}
            className="text-white code-block w-full min-h-[120px] focus:ring-2 focus:ring-secondary outline-none resize-y border-l-primary"
            placeholder="e.g. 15"
            required
          />
          <p className="text-[10px] text-text-muted italic">
            The exact string the program is expected to print to stdout.
          </p>
        </div>
      </div>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-border/50">
        <div className="space-y-2">
          <label className="text-subheading flex items-center">
            <Clock size={16} className="mr-2 text-primary" />
            Execution Timeout (ms)
          </label>
          <input
            type="number"
            name="time_limit"
            value={formData.time_limit}
            onChange={handleChange}
            className="w-full p-2.5 bg-background border border-border rounded text-body focus:border-secondary outline-none"
            min="100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-subheading flex items-center">
            <Trophy size={16} className="mr-2 text-primary" />
            Weight / Points
          </label>
          <input
            type="number"
            step="0.1"
            name="points_possible"
            value={formData.points_possible}
            onChange={handleChange}
            className="w-full p-2.5 bg-background border border-border rounded text-body focus:border-secondary outline-none"
          />
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded border border-border">
        <div className="pt-0.5">
          <input
            type="checkbox"
            id="is_hidden"
            name="is_hidden"
            checked={formData.is_hidden}
            onChange={handleChange}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
        </div>
        <label htmlFor="is_hidden" className="cursor-pointer">
          <span className="text-body font-bold flex items-center">
            <EyeOff size={16} className="mr-2 text-text-muted" />
            Hidden Test Case
          </span>
          <span className="block text-caption mt-1">
            If checked, students will not see the input/output of this test case
            in their results. Useful for preventing &rdquo;hard-coding&rdquo;
            solutions.
          </span>
        </label>
      </div>

      {/* Feedback Messages */}
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
              <div className="mt-4 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStatus({ type: null, message: "" })}
                  className="text-[10px] font-bold uppercase tracking-widest flex items-center hover:underline"
                >
                  <PlusCircle size={14} className="mr-1" /> Add Another
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/app/faculty/${course_id}/assignments/${assignment_id}/test-cases`,
                    )
                  }
                  className="text-[10px] font-bold uppercase tracking-widest flex items-center hover:underline"
                >
                  <ArrowLeft size={14} className="mr-1" /> Back to List
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
        className={`w-full py-4 bg-primary text-white font-bold rounded shadow-subtle hover:bg-accent transition-all uppercase tracking-[0.2em] text-xs ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Processing..." : "Register Test Case"}
      </button>
    </form>
  );
};

export default CreateTestCase;
