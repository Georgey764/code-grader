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
    is_active: true,
    language: "python", // Added from schema
    is_file_input: false, // Added from schema
    starter_code: null, // FileField
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
          is_active: data.is_active ?? true,
          language: data.language ?? "python",
          is_file_input: data.is_file_input ?? false,
          starter_code: null, // Keep null to avoid re-uploading existing file unless changed
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: "Failed to load assignment configuration.",
        });
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

    // Use FormData for FileField support
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
        message: "Assignment configuration updated successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || "Update synchronization failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12 animate-in fade-in duration-500 py-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-surface p-6 md:p-10 rounded-xl border border-border shadow-subtle"
      >
        {/* Assignment Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Type size={14} className="text-secondary" /> Assignment Title
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded text-body focus:ring-2 focus:ring-secondary outline-none transition-all"
            required
          />
        </div>

        {/* Technical Configuration: Language & File Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Terminal size={14} className="text-primary" /> Execution Language
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

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Trophy size={14} className="text-secondary" /> Weight (Max
              Points)
            </label>
            <input
              type="number"
              name="max_points_allowed"
              value={formData.max_points_allowed}
              onChange={handleChange}
              className="w-full p-3 bg-background border border-border rounded text-body font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Calendar size={14} className="text-primary" /> Submission Deadline
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded text-body focus:ring-2 focus:ring-secondary outline-none transition-all"
            required
          />
        </div>

        {/* Starter File: High Visibility Dropzone */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <UploadCloud size={14} className="text-secondary" /> Starter File
          </label>
          <div className="relative border-2 border-dashed border-border rounded-lg p-8 hover:border-secondary transition-colors bg-slate-50/50 group">
            <input
              type="file"
              name="starter_code"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <FileText
                className={`transition-colors ${formData.starter_code ? "text-green-500" : "text-text-muted group-hover:text-secondary"}`}
                size={40}
              />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                  {formData.starter_code
                    ? formData.starter_code.name
                    : "Select new starter source (.zip, .py, .java)"}
                </p>
                <p className="text-[9px] text-text-muted italic">
                  Leave empty to keep existing file
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Boolean Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToggleCard
            icon={<Users size={16} />}
            label="Group Mode"
            name="is_grouped"
            checked={formData.is_grouped}
            onChange={handleChange}
          />
          <ToggleCard
            icon={<FileCode size={16} />}
            label="File-Based Input"
            name="is_file_input"
            checked={formData.is_file_input}
            onChange={handleChange}
          />
          <ToggleCard
            icon={<Power size={16} />}
            label="Active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <AlignLeft size={14} className="text-secondary" /> Prompt /
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full min-h-[150px] p-4 bg-background border border-border rounded text-body leading-relaxed focus:ring-2 focus:ring-secondary outline-none resize-y"
            required
          />
        </div>

        {/* Messaging & Actions */}
        {status.message && (
          <div
            className={`p-4 rounded flex items-start space-x-3 border animate-in zoom-in duration-300 ${
              status.type === "error"
                ? "bg-red-50 border-red-200 text-error"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <AlertCircle
              size={20}
              className={
                status.type === "error" ? "text-error" : "text-green-600"
              }
            />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest">
                {status.type === "error" ? "System Error" : "Success"}
              </p>
              <p className="text-xs">{status.message}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-none px-8 py-4 border-2 border-border text-text-muted font-black rounded uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 py-4 bg-primary text-white font-black rounded shadow-lg hover:bg-accent transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2 ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? (
              <>
                <Save size={16} className="animate-spin" /> Updating...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ToggleCard({ icon, label, name, checked, onChange }) {
  return (
    <label
      className={`flex items-center justify-between p-4 rounded-lg border border-dashed transition-all cursor-pointer ${
        checked
          ? "bg-secondary/5 border-secondary"
          : "bg-background border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={checked ? "text-secondary" : "text-text-muted"}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-accent">
          {label}
        </span>
      </div>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-secondary cursor-pointer"
      />
    </label>
  );
}
