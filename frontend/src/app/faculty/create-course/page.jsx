"use client";

import { useState } from "react";
import { useMetadata } from "@/context";
import { useRouter } from "next/navigation";
import { HeadingWrapper } from "@/components/ui/sections";
import { Button } from "@/components/ui/elements";
import Link from "next/link";

export default function Page() {
  const { api, user } = useMetadata();
  const router = useRouter();

  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    language: "",
    description: "",
    term: "",
    visibility: "visible",
    allow_late: true,
    late_penalty: 10,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post("faculty/courses/", {
        ...formData,
        instructor: user?.cwid,
      });

      router.push("/faculty"); 

    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const BackButton = (
    <Link href="/faculty">
      <Button>Back</Button>
    </Link>
  );

  return (
    <HeadingWrapper name="Create Course" ButtonIn={BackButton}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background p-6">
        
        {/* LEFT CARD */}
        <div className="bg-card p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Course Information</h2>

          {/* Course Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Course Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              name="course_code"
              value={formData.course_code}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Primary Programming Language <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Language</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>



        {/* RIGHT CARD */}
        <div className="bg-card p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Course Settings</h2>

          {/* Term */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Term
            </label>
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            >
              <option value="">Select Term</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
            </select>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Course Visibility
            </label>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value="visible"
                checked={formData.visibility === "visible"}
                onChange={handleChange}
              />
              <span>Visible to Students</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value="hidden"
                checked={formData.visibility === "hidden"}
                onChange={handleChange}
              />
              <span>Hidden (Draft)</span>
            </div>
          </div>

          {/* Allow Late Submission Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold text-text-muted">
              Allow Late Submission
            </span>

            <div className="relative">
              <input
                type="checkbox"
                name="allow_late"
                checked={formData.allow_late}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary transition-colors duration-300"></div>

              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </div>
          </label>

          {/* Late Penalty */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">
              Late Penalty (% per day)
            </label>
            <input
              type="number"
              name="late_penalty"
              value={formData.late_penalty}
              onChange={handleChange}
              className="w-32 border p-2 rounded-lg"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="bg-primary text-white w-full py-3 rounded-full"
          >
            Create Course
          </Button>
        </div>
      </div>
    </HeadingWrapper>
  );
}