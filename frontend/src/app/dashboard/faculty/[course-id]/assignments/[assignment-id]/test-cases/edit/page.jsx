"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  EyeOff,
  CornerDownRight,
  ArrowLeft,
  Paperclip,
} from "lucide-react";

export default function EditTestCasePage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const assignmentId = params["assignment-id"];
  const courseId = params["course-id"];
  const testCaseId = searchParams.get("test_case_id");

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [formData, setFormData] = useState({
    text_input: "",
    expected_output: "",
    time_limit: 1000,
    is_hidden: false,
  });

  useEffect(() => {
    if (!testCaseId || !assignmentId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [assignRes, tcRes] = await Promise.all([
          api.get(`assignments/${assignmentId}/`),
          api.get(`assignments/${assignmentId}/test-cases/${testCaseId}/`),
        ]);
        setAssignment(assignRes.data);

        const data = tcRes.data;

        setFormData({
          text_input: data.text_input ?? "",
          expected_output: data.expected_output ?? "",
          time_limit: parseInt(data.time_limit, 10) || 1000,
          is_hidden: Boolean(data.is_hidden),
        });
      } catch (err) {
        console.log(err);
        setStatus({
          type: "error",
          message: err.response?.data?.detail || "Failed to load test case.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, testCaseId, api]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    if (type === "checkbox") finalValue = checked;
    if (name === "time_limit") finalValue = parseInt(value, 10) || 0;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testCaseId || !assignmentId) return;

    if (!formData.expected_output?.trim()) {
      setStatus({ type: "error", message: "Expected output cannot be empty." });
      return;
    }
    if (formData.time_limit < 100) {
      setStatus({
        type: "error",
        message: "Time limit must be at least 100ms.",
      });
      return;
    }

    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      await api.patch(`assignments/${assignmentId}/test-cases/${testCaseId}/`, {
        text_input: formData.text_input,
        expected_output: formData.expected_output,
        time_limit: formData.time_limit,
        is_hidden: formData.is_hidden,
      });

      setStatus({
        type: "success",
        message: "Test case updated successfully.",
      });
    } catch (err) {
      console.log(err?.response);
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
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-8 bg-surface p-8 rounded-md border border-border shadow-subtle"
      >
        <div className="grid grid-cols-1 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-subheading flex items-center">
              <CornerDownRight size={16} className="mr-2 text-secondary" />
              Input
            </label>

            <textarea
              name="text_input"
              value={formData.text_input ?? ""}
              onChange={handleChange}
              className="text-white code-block w-full min-h-[120px] focus:ring-2 focus:ring-secondary outline-none resize-y"
              placeholder="e.g. 5\n10"
              required
            />
            <p className="text-[10px] text-text-muted italic">
              The input provided to the student&rsquo;s program via stdin.
            </p>
          </div>

          {/* Expected Output */}
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

        {/* Time Limit */}
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
            <p className="text-[10px] text-text-muted italic">Minimum 100ms.</p>
          </div>
        </div>

        {/* Hidden toggle */}
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

        {/* Status */}
        {status.message && (
          <div
            className={`p-4 rounded flex items-start space-x-3 border ${
              status.type === "error"
                ? "bg-red-50 border-red-200 text-error"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {status.type === "error" ? (
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
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
                        `/dashboard/faculty/${courseId}/assignments/${assignmentId}/test-cases`,
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
