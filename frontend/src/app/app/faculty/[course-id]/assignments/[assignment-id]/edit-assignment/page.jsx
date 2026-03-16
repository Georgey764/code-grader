"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  CheckCircle2,
  AlertCircle,
  Type,
  AlignLeft,
  ArrowLeft,
  Calendar,
  Trophy,
  Users,
  Power,
  Save,
  Terminal,
  FileCode,
  UploadCloud,
  FileText,
  Scale,
  Settings2,
  Loader2,
} from "lucide-react";

export default function EditAssignmentPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const assignmentId = params["assignment-id"];
  const courseId = params["course-id"];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    max_points_allowed: 100,
    is_grouped: false,
    language: "python",
    is_file_input: false,
    is_weighted: true, // Added from latest schema
    starter_code: null,
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`assignments/${assignmentId}/`);
        const data = response.data;

        const isoDate = data.deadline
          ? new Date(data.deadline).toISOString().slice(0, 16)
          : "";

        setFormData({
          name: data.name ?? "",
          description: data.description ?? "",
          deadline: isoDate,
          max_points_allowed: data.max_points_allowed ?? 100,
          is_grouped: data.is_grouped ?? false,
          language: data.language ?? "python",
          is_file_input: data.is_file_input ?? false,
          is_weighted: data.is_weighted ?? true,
          starter_code: null,
        });
      } catch (err) {
        setStatus({ type: "error", message: "Failed to load configuration." });
      } finally {
        setLoading(false);
      }
    };
    if (assignmentId) fetchAssignment();
  }, [assignmentId, api]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: "" });

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "starter_code") {
        if (formData[key]) data.append(key, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.patch(`assignments/${assignmentId}/`, data);
      setStatus({
        type: "success",
        message: "Configuration synced successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-secondary to-primary w-full" />

        <div className="p-8 md:p-12 space-y-10">
          {/* Header Area */}
          <div className="flex flex-col gap-1 border-b border-border pb-6">
            <h1 className="text-3xl font-black text-accent uppercase tracking-tighter">
              Edit Assignment
            </h1>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">
              Refine requirements and technical logic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Title - Large Scale */}
            <div className="flex flex-col gap-2 md:col-span-4">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <FileCode size={16} className="text-secondary" /> Project Title
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-base font-bold text-accent"
              />
            </div>

            {/* Language */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Terminal size={16} className="text-primary" /> Execution
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-black text-xs uppercase"
              >
                <option value="python">Python 3.x</option>
                <option value="java">Java (OpenJDK 17)</option>
              </select>
            </div>

            {/* Schedule */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Calendar size={16} className="text-secondary" /> Submission
                Deadline
              </label>
              <input
                required
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
              />
            </div>

            {/* Points */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Trophy size={16} className="text-primary" /> Max Score
              </label>
              <input
                required
                type="number"
                name="max_points_allowed"
                value={formData.max_points_allowed}
                onChange={handleChange}
                className="p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-base font-black"
              />
            </div>

            {/* File Dropzone */}
            <div className="flex flex-col gap-2 md:col-span-6">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <UploadCloud size={16} className="text-secondary" /> Update
                Starter File
              </label>
              <div className="relative border-2 border-dashed border-border rounded-2xl p-10 hover:border-primary transition-all bg-slate-50/30 group text-center cursor-pointer">
                <input
                  type="file"
                  name="starter_code"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <FileText
                  className={`mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 ${formData.starter_code ? "text-green-500" : "text-text-muted"}`}
                  size={40}
                />
                <p className="text-xs font-black uppercase tracking-widest text-accent">
                  {formData.starter_code
                    ? formData.starter_code.name
                    : "Select new template source"}
                </p>
                <p className="text-[10px] text-text-muted mt-2 italic">
                  Leave empty to retain existing file
                </p>
              </div>
            </div>

            {/* Logic Toggles - GLANCEABLE SECTION */}
            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50/50 border border-border/60 rounded-2xl">
              <ToggleSwitch
                icon={<Users size={16} />}
                label="Group Mode"
                sub="Team projects"
                name="is_grouped"
                checked={formData.is_grouped}
                onChange={handleChange}
              />
              <ToggleSwitch
                icon={<Settings2 size={16} />}
                label="File Input"
                sub="Local disk tests"
                name="is_file_input"
                checked={formData.is_file_input}
                onChange={handleChange}
              />
              <ToggleSwitch
                icon={<Scale size={16} />}
                label="Weighted"
                sub="Use rubric weights"
                name="is_weighted"
                checked={formData.is_weighted}
                onChange={handleChange}
                primary
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2 md:col-span-6">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <AlignLeft size={16} className="text-secondary" /> Description &
                Prompt
              </label>
              <textarea
                required
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="p-5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-8 border-t border-border flex flex-col gap-4">
            {status.message && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in duration-300 ${status.type === "error" ? "bg-red-50 text-error border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}
              >
                {status.type === "error" ? (
                  <AlertCircle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                <p className="text-xs font-black uppercase tracking-widest">
                  {status.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] px-2 py-5 bg-accent text-white font-black rounded-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Syncing...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Update Assignment
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-5 border-2 border-border text-text-muted font-black rounded-xl uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function ToggleSwitch({ icon, label, sub, name, checked, onChange, primary }) {
  return (
    <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-xl hover:bg-white transition-all">
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
      </div>
      <div className="flex flex-col">
        <span
          className={`text-[11px] font-black uppercase tracking-tight flex items-center gap-1.5 ${primary ? "text-primary" : "text-accent"}`}
        >
          {icon} {label}
        </span>
        <span className="text-[9px] font-bold text-text-muted uppercase leading-none mt-0.5">
          {sub}
        </span>
      </div>
    </label>
  );
}
