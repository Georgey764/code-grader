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
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileText,
} from "lucide-react";

export default function CreateAssignmentPage() {
  const { api } = useMetadata();
  const params = useParams();
  const course_id = params["course-id"];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    max_points_allowed: 100,
    is_grouped: false,
    starter_code: null,
    language: "python", // ENUM
    is_file_input: false, // BOOL
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
    data.append("course_id", course_id);
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("deadline", formData.deadline);
    data.append("max_points_allowed", formData.max_points_allowed);
    data.append("is_grouped", formData.is_grouped);
    data.append("language", formData.language);
    data.append("is_file_input", formData.is_file_input);

    if (formData.starter_code) {
      data.append("starter_code", formData.starter_code);
    }

    try {
      await api.post("assignments/", data);
      setMessage({ type: "success", text: "Assignment live on roster." });
      setFormData({
        name: "",
        description: "",
        deadline: "",
        max_points_allowed: 100,
        is_grouped: false,
        starter_code: null,
        language: "python",
        is_file_input: false,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Sync failed. Check required fields.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-6">
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="h-1.5 bg-primary w-full" />

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignment Name */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <FileCode size={14} className="text-secondary" /> Assignment
                Title
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Lab 04: Binary Search Trees"
                className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none transition-all"
              />
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Terminal size={14} className="text-primary" /> Execution
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none font-bold text-xs"
              >
                <option value="python">Python 3.x</option>
                <option value="java">Java (OpenJDK 17+)</option>
              </select>
            </div>

            {/* Max Points */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Trophy size={14} className="text-secondary" /> Points Allowed
              </label>
              <input
                required
                type="number"
                name="max_points_allowed"
                value={formData.max_points_allowed}
                onChange={handleChange}
                className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none font-bold"
              />
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Submission
                Deadline
              </label>
              <input
                required
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none text-xs"
              />
            </div>

            {/* Starter File - Clearer Interface */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <UploadCloud size={14} className="text-secondary" /> Starter
                File
              </label>
              <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-secondary transition-colors bg-slate-50/50 group">
                <input
                  type="file"
                  name="starter_code"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <FileText
                    className={`transition-colors ${formData.starter_code ? "text-green-500" : "text-text-muted group-hover:text-secondary"}`}
                    size={32}
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {formData.starter_code
                      ? formData.starter_code.name
                      : "Click or drag to upload source (.zip, .py, .java)"}
                  </p>
                  <p className="text-[9px] text-text-muted">
                    Max file size: 50MB
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Row */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-border/50 bg-slate-50/50 px-4 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_grouped"
                  checked={formData.is_grouped}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    Group Assignment
                  </span>
                  <span className="text-[9px] text-text-muted leading-none">
                    Enable team submissions
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_file_input"
                  checked={formData.is_file_input}
                  onChange={handleChange}
                  className="w-5 h-5 accent-secondary rounded cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    File-Based Input
                  </span>
                  <span className="text-[9px] text-text-muted leading-none">
                    Read test cases from local file
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <AlignLeft size={14} className="text-secondary" /> Project
              Instructions
            </label>
            <textarea
              required
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline technical requirements..."
              className="p-4 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none transition-all text-sm leading-relaxed"
            />
          </div>

          {/* Status Alert */}
          {message.text && (
            <div
              className={`p-4 rounded-md border flex items-center gap-3 animate-in zoom-in duration-300 ${
                message.type === "error"
                  ? "bg-red-50 text-error border-red-200"
                  : "bg-green-50 text-green-800 border-green-200"
              }`}
            >
              <AlertCircle
                size={18}
                className={
                  message.type === "error" ? "text-error" : "text-green-600"
                }
              />
              <p className="text-xs font-bold uppercase tracking-widest">
                {message.text}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-primary text-white font-black rounded-md shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"}
            `}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Publishing...
              </>
            ) : (
              "Publish Assignment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
