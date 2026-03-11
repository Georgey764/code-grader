"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import { BackButton } from "@/components/ui/elements";
import { LoadingPage } from "@/components/ui/sections";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  EyeOff,
  CornerDownRight,
  ArrowLeft,
} from "lucide-react";

export default function EditTestCasePage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const assignmentId = params["assignment-id"];
  const courseId = params["course-id"];
  const testCaseId = searchParams.get("test_case_id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [formData, setFormData] = useState({
    input_text: "",
    expected_output: "",
    time_limit: 1000,
    is_hidden: false,
    points_possible: 10,
  });

  useEffect(() => {
    if (!testCaseId || !assignmentId) {
      setLoading(false);
      return;
    }
    const fetchTestCase = async () => {
      try {
        const response = await api.get(
          `assignments/${assignmentId}/test-cases/${testCaseId}/`,
        );
        const data = response.data;
        setFormData({
          input_text: data.input_text ?? "",
          expected_output: data.expected_output ?? "",
          time_limit: parseInt(data.time_limit, 10) ?? 1000,
          is_hidden: Boolean(data.is_hidden),
          points_possible: parseFloat(data.points_possible) ?? 10,
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: err.response?.data?.detail || "Failed to load test case.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTestCase();
  }, [assignmentId, testCaseId, api]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    if (type === "checkbox") finalValue = checked;
    if (name === "time_limit") finalValue = parseInt(value, 10) || 0;
    if (name === "points_possible") finalValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testCaseId || !assignmentId) return;
    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      await api.patch(
        `assignments/${assignmentId}/test-cases/${testCaseId}/`,
        formData,
      );
      setStatus({
        type: "success",
        message: "Test case updated successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          Object.values(err.response?.data || {})
            .flat()
            .join(" ") ||
          "Failed to update test case.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  if (!testCaseId) {
    return (
      <div>
        <div className="mt-6 p-6 bg-surface border border-border rounded-md text-center">
          <AlertCircle className="mx-auto text-error mb-3" size={32} />
          <p className="text-body font-medium">
            Missing <code className="text-accent">test_case_id</code> query
            parameter.
          </p>
          <p className="text-caption text-text-muted mt-2">
            Open this page from the test cases list using the edit action on a
            test case.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-8 bg-surface p-8 rounded-md border border-border shadow-subtle"
      >
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
              className="text-white code-block w-full min-h-[120px] focus:ring-2 focus:ring-secondary outline-none border-l-primary"
              placeholder="e.g. 15"
              required
            />
            <p className="text-[10px] text-text-muted italic">
              The exact string the program is expected to print to stdout.
            </p>
          </div>
        </div>

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
              If checked, students will not see the input/output of this test
              case in their results.
            </span>
          </label>
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
                        `/app/faculty/${courseId}/assignments/${assignmentId}/test-cases`,
                      )
                    }
                    className="cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center text-accent hover:text-primary transition-colors"
                  >
                    <ArrowLeft size={14} className="mr-1" /> Back to List
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 bg-primary text-white font-bold rounded shadow-subtle hover:bg-accent transition-all uppercase tracking-[0.2em] text-xs cursor-pointer ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving..." : "Update Test Case"}
        </button>
      </form>
    </div>
  );
}
