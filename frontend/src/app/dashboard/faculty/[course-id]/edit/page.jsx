"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  Save,
  Hash,
  Type,
  AlignLeft,
  Power,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ShieldPlus,
} from "lucide-react";

const EditCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params["course-id"];
  const { api } = useMetadata();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // Toggle state for GA requirement
  const [hasGA, setHasGA] = useState("no");

  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    crn: "",
    is_active: true,
    description: "",
    grading_assistant_profile: null, //
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`courses/${courseId}/`);
        const data = response.data;

        setFormData({
          name: data.name,
          short_name: data.short_name,
          crn: data.crn,
          is_active: data.is_active,
          description: data.description,
          grading_assistant_profile: data.grading_assistant_profile, //
        });

        // Set the toggle based on existing data
        if (data.grading_assistant_profile) {
          setHasGA("yes");
        }
      } catch (err) {
        setStatus({ type: "error", message: "Failed to load course details." });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [api, courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: null, message: "" });

    // Ensure GA is set to null if the instructor toggles the requirement off
    const submissionData = {
      ...formData,
      grading_assistant_profile:
        hasGA === "yes" ? formData.grading_assistant_profile : null,
    };

    try {
      await api.patch(`courses/${courseId}/`, submissionData);

      setStatus({
        type: "success",
        message: "Course configuration updated successfully.",
      });

      setTimeout(() => router.push(`/dashboard/faculty/${courseId}`), 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.detail ||
          "An error occurred while saving changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className=" mx-auto px-4 pb-12">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-surface p-6 md:p-10 rounded-xl border border-border shadow-subtle"
      >
        {/* Core Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-subheading flex items-center">
              <Type size={16} className="mr-2 text-secondary" /> Course Name
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

          <div className="space-y-2">
            <label className="text-subheading flex items-center">
              <Hash size={16} className="mr-2 text-secondary" /> Short Name /
              Code
            </label>
            <input
              type="text"
              name="short_name"
              value={formData.short_name}
              onChange={handleChange}
              className="w-full p-3 bg-background border border-border rounded text-body focus:ring-2 focus:ring-secondary outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-subheading flex items-center">
              <Hash size={16} className="mr-2 text-primary" /> CRN
            </label>
            <input
              type="text"
              name="crn"
              maxLength={5}
              value={formData.crn}
              onChange={handleChange}
              className="w-full p-3 bg-background border border-border rounded text-body focus:ring-2 focus:ring-secondary outline-none transition-all"
              required
            />
          </div>

          <div className="flex flex-col justify-end pb-1">
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-border rounded cursor-pointer group">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-1">
                  <Power
                    size={14}
                    className={
                      formData.is_active ? "text-green-500" : "text-text-muted"
                    }
                  />
                  Active Status
                </span>
                <span className="text-[10px] text-text-muted italic">
                  Visible to students in the portal
                </span>
              </div>
            </label>
          </div>
        </div>

        <hr className="border-border border-dashed" />

        {/* Grading Assistant (GA) Section */}
        <div className="bg-slate-50/50 p-6 rounded-lg border border-border space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-accent">
                Staffing & Support
              </h3>
              <p className="text-[10px] text-text-muted">
                Is a Grading Assistant assigned to this course?
              </p>
            </div>

            <select
              value={hasGA}
              onChange={(e) => setHasGA(e.target.value)}
              className="p-2.5 bg-background border border-border rounded-md text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all min-w-[140px]"
            >
              <option value="no">No Assistant</option>
              <option value="yes">Assign GA</option>
            </select>
          </div>

          {hasGA === "yes" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-2">
                <UserCheck size={14} className="text-secondary" /> Grading
                Assistant Profile UUID
              </label>
              <input
                name="grading_assistant_profile"
                value={formData.grading_assistant_profile || ""}
                onChange={handleChange}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-sm"
              />
              <p className="mt-2 text-[9px] text-text-muted italic">
                Must be a valid profile identifier to grant system permissions.
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-subheading flex items-center">
            <AlignLeft size={16} className="mr-2 text-secondary" /> Course
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

        {/* Messaging */}
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
            <p className="text-xs font-bold uppercase tracking-widest">
              {status.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
          <button
            type="submit"
            disabled={isSaving}
            className={`cursor-pointer flex-1 py-4 bg-primary text-white font-black rounded shadow-subtle hover:bg-accent transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              "Syncing..."
            ) : (
              <>
                <Save size={16} /> Update Course Configuration
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer px-8 py-4 border-2 border-border text-text-muted font-black rounded uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
