"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  FileEdit,
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
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`assignments/${assignmentId}/`);
        const data = response.data;

        // Format ISO date to YYYY-MM-DDThh:mm for datetime-local input
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      await api.patch(`assignments/${assignmentId}/`, formData);
      setStatus({
        type: "success",
        message: "Assignment updated successfully.",
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
    <div className="max-w-4xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-surface p-6 md:p-10 rounded-xl border border-border shadow-subtle"
      >
        {/* Row 1: Assignment Title */}
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

        {/* Row 2: Deadline & Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> Submission
              Deadline
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

          <div className="space-y-2">
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

        {/* Row 3: Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleCard
            icon={<Users size={16} />}
            label="Group Submission"
            name="is_grouped"
            checked={formData.is_grouped}
            onChange={handleChange}
          />
          <ToggleCard
            icon={<Power size={16} />}
            label="Accepting Uploads"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
        </div>

        {/* Row 4: Description */}
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
            placeholder="Outline requirements, submission rules, and evaluation criteria..."
            required
          />
        </div>

        {/* Status Messaging */}
        {status.message && (
          <div
            className={`p-4 rounded flex items-start space-x-3 border animate-in zoom-in duration-300 ${
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
              <p className="text-xs font-black uppercase tracking-widest">
                {status.type === "error" ? "System Error" : "Success"}
              </p>
              <p className="text-xs">{status.message}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`cursor-pointer w-full py-4 bg-primary text-white font-black rounded shadow-lg hover:bg-accent transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2 ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Syncing Changes...
            </>
          ) : (
            <>
              <Save size={16} /> Update Assignment
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/** * Helper for Toggle UI Cards */
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

function Loader2({ size, className }) {
  return <Save size={size} className={className} />; // Placeholder for actual spinner icon if not imported
}
