"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import { HeadingWrapper } from "@/components/ui/sections";

export default function CreateAssignmentPage() {
  const { api } = useMetadata();
  const params = useParams();

  // Extract course_id from the URL: faculty/[id]/assignments/...
  const course_id = params["course-id"];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    max_points_allowed: 100,
    is_grouped: false,
    starter_code: null,
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

    // Since we have a FileField, we use FormData
    const data = new FormData();
    data.append("course", course_id);
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("deadline", formData.deadline);
    data.append("max_points_allowed", formData.max_points_allowed);
    data.append("is_grouped", formData.is_grouped);

    if (formData.starter_code) {
      data.append("starter_code", formData.starter_code);
    }

    try {
      const response = await api.post("assignments/", data);
      if (response) {
        setMessage({
          type: "success",
          text: "Assignment created successfully!",
        });
        // Reset form (except course_id)
        setFormData({
          name: "",
          description: "",
          deadline: "",
          max_points_allowed: 100,
          is_grouped: false,
          starter_code: null,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to create assignment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="px-12 py-12 bg-surface rounded-xl border border-border shadow-subtle ">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignment Name (varchar 255) */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-subheading text-xs">Assignment Name</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Project 1: SQL Basics"
                className="p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>

            {/* Deadline (TIMESTAMP) */}
            <div className="flex flex-col gap-2">
              <label className="text-subheading text-xs">Deadline</label>
              <input
                required
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>

            {/* Max Points (INT) */}
            <div className="flex flex-col gap-2">
              <label className="text-subheading text-xs">Max Points</label>
              <input
                required
                type="number"
                name="max_points_allowed"
                value={formData.max_points_allowed}
                onChange={handleChange}
                className="p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>

            {/* Starter Code (FileField) */}
            <div className="flex flex-col gap-2">
              <label className="text-subheading text-xs">
                Starter Code (.zip, .py)
              </label>
              <input
                type="file"
                name="starter_code"
                onChange={handleChange}
                className="text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:opacity-90"
              />
            </div>

            {/* Is Grouped (Boolean) */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                name="is_grouped"
                id="is_grouped"
                checked={formData.is_grouped}
                onChange={handleChange}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
              <label
                htmlFor="is_grouped"
                className="text-body font-weight-bold cursor-pointer"
              >
                Group Assignment
              </label>
            </div>
          </div>

          {/* Description (Text) */}
          <div className="flex flex-col gap-2">
            <label className="text-subheading text-xs">
              Description & Instructions
            </label>
            <textarea
              required
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed instructions for the students..."
              className="p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
            />
          </div>

          {/* Messages */}
          {message.text && (
            <div
              className={`p-4 rounded-md text-sm border ${
                message.type === "error"
                  ? "bg-red-50 text-error border-red-200"
                  : "bg-green-50 text-green-800 border-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-primary text-white font-weight-bold rounded-md transition-all
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent shadow-subtle"}
            `}
          >
            {loading ? "Uploading Assignment..." : "Publish Assignment"}
          </button>
        </form>
      </div>
    </>
  );
}
