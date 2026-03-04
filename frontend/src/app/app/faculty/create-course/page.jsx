"use client";

import { useState } from "react";
import { useMetadata } from "@/context";
import {
  UserCheck,
  ShieldPlus,
  Hash,
  Type,
  AlignLeft,
  Power,
} from "lucide-react";

export default function CreateCoursePage() {
  const { api } = useMetadata();

  // State matching the database schema including GA profile
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    crn: "",
    is_active: true,
    description: "",
    grading_assistant_profile: null, // Added as requested
  });

  const [hasGA, setHasGA] = useState("no");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Prepare data: Ensure GA is null if not needed
    const submissionData = {
      ...formData,
      grading_assistant_profile:
        hasGA === "yes" ? formData.grading_assistant_profile : null,
    };

    try {
      const response = await api.post("courses/", submissionData);

      if (response) {
        setMessage({ type: "success", text: "Course created successfully!" });
        setFormData({
          name: "",
          short_name: "",
          crn: "",
          is_active: true,
          description: "",
          grading_assistant_profile: null,
        });
        setHasGA("no");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to create course. Please verify the UUIDs and CRN format.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Primary Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <Hash size={14} className="text-secondary" /> CRN (5-digits)
                </label>
                <input
                  required
                  maxLength={5}
                  name="crn"
                  value={formData.crn}
                  onChange={handleChange}
                  placeholder="e.g. 10293"
                  className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <Type size={14} className="text-secondary" /> Short Name /
                  Code
                </label>
                <input
                  required
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleChange}
                  placeholder="e.g. CSCI 4060"
                  className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <ShieldPlus size={14} className="text-primary" /> Full Course
                  Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineering Fundamentals"
                  className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none transition-all"
                />
              </div>
            </div>

            <hr className="border-border border-dashed" />

            {/* Grading Assistant Section */}
            <div className="bg-slate-50/50 p-6 rounded-lg border border-border space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-accent">
                    Staffing Requirements
                  </h3>
                  <p className="text-[10px] text-text-muted">
                    Will this course require a Grading Assistant?
                  </p>
                </div>

                <select
                  value={hasGA}
                  onChange={(e) => setHasGA(e.target.value)}
                  className="p-2.5 bg-background border border-border rounded-md text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all min-w-[120px]"
                >
                  <option value="no">No Assistant</option>
                  <option value="yes">Assign GA</option>
                </select>
              </div>

              {hasGA === "yes" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-2">
                    <UserCheck size={14} className="text-secondary" /> Grading
                    Assistant UUID
                  </label>
                  <input
                    name="grading_assistant_profile"
                    value={formData.grading_assistant_profile || ""}
                    onChange={handleChange}
                    placeholder="00000000-0000-0000-0000-000000000000"
                    className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-sm"
                  />
                  <p className="mt-2 text-[9px] text-text-muted italic italic">
                    Paste the unique profile identifier of the assigned GA.
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <AlignLeft size={14} className="text-secondary" /> Course
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly summarize the course objectives..."
                className="p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none transition-all resize-none"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex flex-col gap-4">
              {message.text && (
                <div
                  className={`p-4 rounded-md text-xs font-bold border flex items-center gap-3 animate-in zoom-in duration-300 ${
                    message.type === "error"
                      ? "bg-red-50 text-error border-red-200"
                      : "bg-green-50 text-green-800 border-green-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${message.type === "error" ? "bg-error" : "bg-green-600"}`}
                  />
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3
                  ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"}
                `}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  "Finalize Course"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
