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
  FileCode,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function CreateTestCase() {
  const params = useParams();
  const router = useRouter();
  const assignment_id = params["assignment-id"];
  const course_id = params["course-id"];
  const { api } = useMetadata();

  // State Management
  const [mode, setMode] = useState("manual"); // manual | bulk
  const [loading, setLoading] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [bulkData, setBulkData] = useState("");

  const [formData, setFormData] = useState({
    input_text: "",
    expected_output: "",
    time_limit: 1000,
    is_hidden: false,
    points_possible: 10,
  });

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "time_limit") finalValue = parseInt(value) || 0;
    if (name === "points_possible") finalValue = parseFloat(value) || 0;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`assignments/${assignment_id}/test-cases/`, {
        ...formData,
        assignment: assignment_id,
      });
      setStatus({
        type: "success",
        message: "Manual test case registered successfully.",
      });
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
          <TabButton
            active={mode === "bulk"}
            onClick={() => setMode("bulk")}
            label="Bulk JSON"
          />
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
              onReset={() => setStatus({ type: null, message: "" })}
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

/** * --- Sub-Components --- */

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-white shadow-sm text-primary"
          : "text-text-muted hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function TemplateGuide() {
  return (
    <div className="bg-slate-50 border border-border rounded-lg p-5 animate-in slide-in-from-top-2 duration-300">
      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">
        Required JSON Structure
      </p>
      <pre className="text-[11px] font-mono text-accent leading-relaxed bg-white p-4 rounded border border-border overflow-x-auto">
        {`[
  {
    "input_text": "5\\n10",
    "expected_output": "15",
    "time_limit": 1000,
    "is_hidden": false,
    "points_possible": 10
  }
]`}
      </pre>
      <p className="text-[9px] text-text-muted mt-3 italic">
        * Ensure escaped characters like newlines (\\n) are properly formatted
        in strings.
      </p>
    </div>
  );
}

function StatusAlert({ type, message }) {
  return (
    <div
      className={`p-4 rounded-md flex items-start gap-3 border animate-in zoom-in duration-300 ${
        type === "error"
          ? "bg-red-50 border-red-200 text-error"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      {type === "error" ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle2 size={20} />
      )}
      <p className="text-xs font-bold leading-relaxed">{message}</p>
    </div>
  );
}

function ManualForm({
  formData,
  loading,
  status,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <CornerDownRight size={14} className="text-secondary" /> Standard
            Input
          </label>
          <textarea
            name="input_text"
            value={formData.input_text}
            onChange={onChange}
            className="w-full min-h-[120px] p-4 bg-background border border-border rounded font-mono text-sm focus:ring-1 focus:ring-secondary outline-none"
            placeholder="e.g. 5\n10"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <CornerDownRight size={14} className="text-secondary" /> Expected
            Output
          </label>
          <textarea
            name="expected_output"
            value={formData.expected_output}
            onChange={onChange}
            className="w-full min-h-[120px] p-4 bg-background border border-border rounded font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
            placeholder="e.g. 15"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-border/50">
        <ConfigInput
          icon={<Clock size={16} />}
          label="Timeout (ms)"
          name="time_limit"
          value={formData.time_limit}
          onChange={onChange}
        />
        <ConfigInput
          icon={<Trophy size={16} />}
          label="Weight / Points"
          name="points_possible"
          value={formData.points_possible}
          onChange={onChange}
        />
      </div>

      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded border border-border">
        <input
          type="checkbox"
          name="is_hidden"
          checked={formData.is_hidden}
          onChange={onChange}
          className="w-5 h-5 accent-primary mt-1"
        />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
            <EyeOff size={14} /> Hidden Test Case
          </p>
          <p className="text-[11px] text-text-muted">
            Hide inputs/outputs from student results to prevent hard-coding.
          </p>
        </div>
      </div>

      {status.message && (
        <StatusAlert type={status.type} message={status.message} />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Layers size={16} className="animate-spin" />
        ) : (
          "Register Test Case"
        )}
      </button>
    </form>
  );
}

function ConfigInput({ icon, label, name, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
        {React.cloneElement(icon, { size: 14, className: "text-primary" })}{" "}
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2.5 bg-background border border-border rounded text-sm font-bold focus:ring-1 focus:ring-secondary outline-none"
        min="0"
      />
    </div>
  );
}
