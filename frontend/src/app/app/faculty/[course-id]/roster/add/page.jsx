"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
  ArrowLeft,
  FileUp,
  FileText,
  Users,
  XCircle,
} from "lucide-react";

export default function AddToRosterPage() {
  const params = useParams();
  const router = useRouter();
  const { api } = useMetadata();
  const fileInputRef = useRef(null);

  // Extract course-id from URL params
  const courseId = params["course-id"];

  // Individual Form State
  const [cwid, setCwid] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // Batch State
  const [mode, setMode] = useState("individual"); // individual | batch
  const [batchFile, setBatchFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null); // { success: [], errors: [] }

  /** * --- Individual Enrollment --- */
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!cwid.trim()) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      await api.post(`courses/${courseId}/rosters/?cwid=${cwid}`);
      setStatus({
        type: "success",
        message: `Student with CWID ${cwid} added successfully.`,
      });
      setCwid("");
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "Could not add student. Verify the CWID and profile existence.",
      });
    } finally {
      setLoading(false);
    }
  };

  /** * --- Batch Enrollment Logic --- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      setBatchFile(file);
      setBatchResults(null);
    } else {
      alert("Please upload a valid .txt file.");
      setBatchFile(null);
    }
  };

  const processBatch = async () => {
    if (!batchFile) return;
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const successes = [];
      const failures = [];

      for (const id of lines) {
        try {
          // Sequential processing to capture individual error reasons
          await api.post(`courses/${courseId}/rosters/?cwid=${id}`);
          successes.push(id);
        } catch (err) {
          const reason =
            err.response?.data?.detail ||
            "Unknown error (Possible duplicate or invalid profile)";
          failures.push({ id, reason });
        }
      }

      setBatchResults({ success: successes, errors: failures });
      setLoading(false);
      setBatchFile(null);
    };

    reader.readAsText(batchFile);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-border">
          <button
            onClick={() => {
              setMode("individual");
              setBatchResults(null);
            }}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${mode === "individual" ? "bg-white shadow-sm text-primary" : "text-text-muted"}`}
          >
            Individual
          </button>
          <button
            onClick={() => {
              setMode("batch");
              setStatus({ type: null, message: "" });
            }}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${mode === "batch" ? "bg-white shadow-sm text-primary" : "text-text-muted"}`}
          >
            Batch (.txt)
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Maroon Accent Bar */}
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-8 md:p-12 text-center">
          {/* Header */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            {mode === "individual" ? (
              <UserPlus size={32} />
            ) : (
              <Users size={32} />
            )}
          </div>
          <h1 className="text-h2 uppercase mb-2 tracking-tighter">
            {mode === "individual" ? "Enroll Student" : "Batch Enrollment"}
          </h1>
          <p className="text-caption mb-10 max-w-sm mx-auto">
            {mode === "individual"
              ? "Enter the student's 8-digit Campus Wide ID."
              : "Upload a plain text file with one CWID per line."}
          </p>

          {/* Individual Form */}
          {mode === "individual" && (
            <form
              onSubmit={handleAddStudent}
              className="space-y-6 max-w-md mx-auto"
            >
              <div className="relative group text-left">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors">
                  <Hash size={20} />
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="e.g. 30123456"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-md font-mono text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
                  value={cwid}
                  onChange={(e) => setCwid(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              {status.message && (
                <StatusMessage type={status.type} message={status.message} />
              )}

              <ActionButton
                loading={loading}
                disabled={cwid.length < 1}
                label="Enroll Student"
              />
            </form>
          )}

          {/* Batch Upload Area */}
          {mode === "batch" && !batchResults && (
            <div className="space-y-8 max-w-md mx-auto">
              <div
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${batchFile ? "border-secondary bg-secondary/5" : "border-border hover:border-primary bg-background"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-4">
                  <FileUp
                    size={40}
                    className={batchFile ? "text-secondary" : "text-text-muted"}
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest">
                      {batchFile ? batchFile.name : "Select .txt File"}
                    </p>
                    {!batchFile && (
                      <p className="text-[10px] text-text-muted italic">
                        Max: 100 students per file
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ActionButton
                loading={loading}
                disabled={!batchFile}
                label="Process Roster File"
                onClick={processBatch}
              />
            </div>
          )}

          {/* Batch Results Summary */}
          {batchResults && (
            <div className="animate-in zoom-in duration-300 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-accent">
                  Process Summary
                </h3>
                <button
                  onClick={() => setBatchResults(null)}
                  className="text-[10px] font-bold text-primary uppercase"
                >
                  Clear Results
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Success Column */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-green-700 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Successful (
                    {batchResults.success.length})
                  </p>
                  <div className="bg-green-50/50 border border-green-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                    {batchResults.success.length > 0 ? (
                      batchResults.success.map((id) => (
                        <div
                          key={id}
                          className="text-[11px] font-mono text-green-800"
                        >
                          {id}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] italic text-text-muted">
                        No students added
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Column */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-error flex items-center gap-2">
                    <XCircle size={14} /> Errors ({batchResults.errors.length})
                  </p>
                  <div className="bg-red-50/50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {batchResults.errors.length > 0 ? (
                      batchResults.errors.map((err, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="text-[11px] font-mono font-bold text-error">
                            {err.id}
                          </div>
                          <div className="text-[9px] text-red-600 italic leading-tight">
                            {err.reason}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] italic text-text-muted">
                        No errors detected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** * --- UI Sub-Components --- */

function StatusMessage({ type, message }) {
  return (
    <div
      className={`p-4 rounded-md flex items-start text-left gap-3 border animate-in zoom-in duration-300 ${
        type === "error"
          ? "bg-red-50 border-red-200 text-error"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      {type === "error" ? (
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
      )}
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest leading-none">
          {type === "error" ? "System Alert" : "Enrollment Success"}
        </p>
        <p className="text-xs font-medium leading-tight">{message}</p>
      </div>
    </div>
  );
}

function ActionButton({ loading, disabled, label, onClick = null }) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"}
      `}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Processing Data...
        </>
      ) : (
        <>
          <FileText size={16} /> {label}
        </>
      )}
    </button>
  );
}
