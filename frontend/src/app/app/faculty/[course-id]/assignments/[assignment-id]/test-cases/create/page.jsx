"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import { FileCode, Layers, Info, Loader2 } from "lucide-react";
import TabButton from "./(helper)/TabButton";
import TemplateGuide from "./(helper)/TemplateGuide";
import ManualForm from "./(helper)/ManualForm";
import StatusAlert from "./(helper)/StatusAlert";

export default function CreateTestCase() {
  const params = useParams();
  const assignment_id = params["assignment-id"];
  const { api } = useMetadata();

  // State Management
  const [mode, setMode] = useState("manual"); // manual | bulk
  const [loading, setLoading] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [bulkData, setBulkData] = useState("");

  const [assignment, setAssignment] = useState(null);

  const [formData, setFormData] = useState({
    input_content: "",
    expected_output: "",
    time_limit: 1000,
    is_hidden: false,
    input_file: null,
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`assignments/${assignment_id}/`);
        setAssignment(response.data);
      } catch (err) {
        console.error("Failed to load assignment details", err);
      }
    };

    fetchAssignment();
  }, [api, assignment_id]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "time_limit") finalValue = parseInt(value) || 0;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleFileChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, input_file: file }));
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (assignment?.is_file_input) {
        const payload = new FormData();
        if (formData.input_file) {
          payload.append("input_file", formData.input_file);
        }
        payload.append("expected_output", formData.expected_output);
        payload.append("time_limit", String(formData.time_limit));
        payload.append("is_hidden", String(formData.is_hidden));
        payload.append("assignment", assignment_id);

        await api.post(
          `assignments/${assignment_id}/test-cases/`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        await api.post(`assignments/${assignment_id}/test-cases/`, {
          input_content: formData.input_content,
          expected_output: formData.expected_output,
          time_limit: formData.time_limit,
          is_hidden: formData.is_hidden,
          assignment: assignment_id,
        });
      }
      setStatus({
        type: "success",
        message: "Manual test case registered successfully.",
      });
      setFormData({
        input_content: "",
        expected_output: "",
        time_limit: 1000,
        is_hidden: false,
        input_file: null,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Registration failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (assignment?.is_file_input) {
        throw new Error(
          "Bulk JSON is only supported for text-input assignments.",
        );
      }

      const parsedData = JSON.parse(bulkData);
      if (!Array.isArray(parsedData))
        throw new Error("Data must be a JSON array.");

      // Sequential processing to ensure database integrity
      for (const item of parsedData) {
        await api.post(`assignments/${assignment_id}/test-cases/`, {
          ...item,
          assignment: assignment_id,
        });
      }

      setStatus({
        type: "success",
        message: `Successfully registered ${parsedData.length} test cases.`,
      });
      setBulkData("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Bulk parse error. Check your JSON format.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-border">
          <TabButton
            active={mode === "manual"}
            onClick={() => setMode("manual")}
            label="Manual Entry"
          />
          {!assignment?.is_file_input && (
            <TabButton
              active={mode === "bulk"}
              onClick={() => setMode("bulk")}
              label="Bulk JSON"
            />
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden relative">
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-6 md:p-10">
          {mode === "manual" ? (
            <ManualForm
              formData={formData}
              loading={loading}
              status={status}
              onChange={handleChange}
              onSubmit={handleIndividualSubmit}
              onFileChange={handleFileChange}
              onReset={() => setStatus({ type: null, message: "" })}
              isFileInput={!!assignment?.is_file_input}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-accent">
                  Bulk Register Test Cases
                </h3>
                <button
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="text-[10px] font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
                >
                  <Info size={14} />{" "}
                  {showTemplate ? "Hide Template" : "Show Template"}
                </button>
              </div>

              {showTemplate && <TemplateGuide />}

              <form onSubmit={handleBulkSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute top-4 right-4 text-text-muted opacity-20 pointer-events-none">
                    <Layers size={40} />
                  </div>
                  <textarea
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    className="w-full min-h-[350px] p-6 bg-slate-950 text-green-400 font-mono text-xs rounded-lg border border-border focus:ring-2 focus:ring-secondary outline-none shadow-inner"
                    placeholder={`[ \n  { "input_text": "...", "expected_output": "...", ... } \n]`}
                    required
                  />
                </div>

                {status.message && (
                  <StatusAlert type={status.type} message={status.message} />
                )}

                <button
                  type="submit"
                  disabled={loading || !bulkData.trim()}
                  className="w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileCode size={16} />
                  )}
                  {loading ? "Processing Batch..." : "Synchronize Test Suite"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
