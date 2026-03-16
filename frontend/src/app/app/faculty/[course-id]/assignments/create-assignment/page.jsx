"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Calendar,
  Trophy,
  Terminal,
  Users,
  FileCode,
  AlignLeft,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileText,
  Scale,
  Settings2,
} from "lucide-react";

export default function CreateAssignmentPage() {
  const { api } = useMetadata();
  const params = useParams();
  const courseId = params["course-id"];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    max_points_allowed: 100, // Kept for UI, though not in schema
    is_grouped: false,
    starter_code: null,
    language: "python",
    is_file_input: false,
    is_weighted: true, // NEW: Based on schema
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
    setLoading(true);
    setMessage({ type: "", text: "" });

    const data = new FormData();
    data.append("course", courseId);
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("deadline", formData.deadline);
    data.append("is_grouped", formData.is_grouped);
    data.append("language", formData.language);
    data.append("is_file_input", formData.is_file_input);
    data.append("is_weighted", formData.is_weighted);

    if (formData.starter_code) {
      data.append("starter_code", formData.starter_code);
    }

    try {
      await api.post("assignments/", data);
      setMessage({
        type: "success",
        text: "Assignment published successfully.",
      });
      // Reset form...
    } catch (error) {
      console.error("Submission error", error.response?.data);
      setMessage({
        type: "error",
        text: "Failed to publish. Check required fields.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-4">
      <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Decorative Header Accent */}
        <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full" />

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Title */}
            <div className="flex flex-col gap-2 md:col-span-4">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <FileCode size={16} className="text-secondary" /> Project Title
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Lab 04: Linked Lists"
                className="p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-base font-bold text-accent"
              />
            </div>

            {/* Language */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Terminal size={16} className="text-primary" /> Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-black text-xs uppercase tracking-tight"
              >
                <option value="python">Python 3.x</option>
                <option value="java">Java (OpenJDK 17)</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Calendar size={16} className="text-secondary" /> Due Date &
                Time
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

            {/* Max Points */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Trophy size={16} className="text-primary" /> Point Value
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

            {/* Starter Code Upload */}
            <div className="flex flex-col gap-2 md:col-span-6">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <UploadCloud size={16} className="text-secondary" /> Starter
                Templates
              </label>
              <div className="relative border-2 border-dashed border-border rounded-2xl p-10 hover:border-primary transition-all bg-slate-50/30 group cursor-pointer text-center">
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
                    : "Drop starter files here or click to browse"}
                </p>
                <p className="text-[10px] text-text-muted mt-2">
                  Accepted: .zip, .py, .java (Max 50MB)
                </p>
              </div>
            </div>

            {/* Settings Toggles (The "Glancable" Section) */}
            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50/50 border border-border/60 rounded-2xl">
              <ToggleSwitch
                icon={<Users size={16} />}
                label="Group Project"
                sub="Team-based submissions"
                name="is_grouped"
                checked={formData.is_grouped}
                onChange={handleChange}
              />
              <ToggleSwitch
                icon={<Settings2 size={16} />}
                label="File Input"
                sub="Local test case handling"
                name="is_file_input"
                checked={formData.is_file_input}
                onChange={handleChange}
              />
              <ToggleSwitch
                icon={<Scale size={16} />}
                label="Weighted Rubric"
                sub="Score by criteria weights"
                name="is_weighted"
                checked={formData.is_weighted}
                onChange={handleChange}
                primary
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2 md:col-span-6">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <AlignLeft size={16} className="text-primary" /> Technical
                Instructions
              </label>
              <textarea
                required
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Markdown supported. Outline project requirements, constraints, and submission guidelines..."
                className="p-5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-border flex flex-col gap-4">
            {message.text && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 animate-in zoom-in duration-300 ${message.type === "error" ? "bg-red-50 text-error border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}
              >
                <AlertCircle size={20} />
                <p className="text-xs font-black uppercase tracking-widest">
                  {message.text}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-accent text-white font-black rounded-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />{" "}
                  Synchronizing...
                </>
              ) : (
                "Publish to Roster"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleSwitch({ icon, label, sub, name, checked, onChange, primary }) {
  return (
    <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-lg hover:bg-white transition-all">
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </div>
      <div className="flex flex-col">
        <span
          className={`text-[11px] font-black uppercase tracking-tight ${primary ? "text-primary" : "text-accent"}`}
        >
          {label}
        </span>
        <span className="text-[9px] font-bold text-text-muted uppercase leading-none mt-0.5">
          {sub}
        </span>
      </div>
    </label>
  );
}
