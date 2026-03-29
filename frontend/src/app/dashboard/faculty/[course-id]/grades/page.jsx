"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { FileBarChart } from "lucide-react";

import AssignmentAccordion from "./(helper)/AssignmentAccordion";

export default function GradebookPage() {
  const { api } = useMetadata();
  const params = useParams();
  const courseId = params["course-id"];
  const router = useRouter();

  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAssignment, setOpenAssignment] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchGrades = async () => {
      try {
        const response = await api.get(`courses/${courseId}/grades/`);
        setGradeData(response.data);
        setOpenAssignment(response.data?.[0]?.assignment_id ?? null);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [api, courseId]);

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
<<<<<<< HEAD:frontend/src/app/app/faculty/[course-id]/grades/page.jsx
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 pb-8">
        <div className="relative w-full max-w-md">
          {/* This wrapper ensures the search icon stays inside the input */}
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={14}
          />
          <input
            type="text"
            placeholder="Filter by name or ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="space-y-4">
        {gradeData.map((assignment) => (
          <AssignmentAccordion
            key={assignment.assignment_id}
            assignment={assignment}
            isOpen={openAssignment === assignment.assignment_id}
            toggle={() =>
              setOpenAssignment(
                openAssignment === assignment.assignment_id
                  ? null
                  : assignment.assignment_id,
              )
            }
            searchTerm={searchTerm}
            onSelect={(row) => {
              const submissionId = row?.submission?.id;
              if (!submissionId) return;
              router.push(
                `/app/faculty/${courseId}/grades/${submissionId}`,
              );
            }}
          />
        ))}
=======
      <header className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 sm:justify-between">
        <input
          type="text"
          placeholder="Filter by name or ID..."
          className="w-full sm:flex-1 pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link
          href={`/dashboard/faculty/${courseId}/grade-report`}
          className="inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent border border-primary/30 hover:border-primary px-3 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <FileBarChart size={14} />
          Student grade report
        </Link>
      </header>

      <div className="space-y-4">
        {gradeData.map((assignment) => {
          return (
            <AssignmentAccordion
              key={assignment.assignment_id}
              assignment={assignment}
              isOpen={openAssignment === assignment.assignment_id}
              toggle={() =>
                setOpenAssignment(
                  openAssignment === assignment.assignment_id
                    ? null
                    : assignment.assignment_id,
                )
              }
              searchTerm={searchTerm}
              onSelect={(row) => {
                const submissionId = row?.submission?.id;
                if (!submissionId) return;
                router.push(
                  `/dashboard/faculty/${courseId}/grades/${submissionId}`,
                );
              }}
            />
          );
        })}
>>>>>>> 7005cc5e9edc29f7cd3c8153bf2dde3f4987a0d2:frontend/src/app/dashboard/faculty/[course-id]/grades/page.jsx
      </div>
    </div>
  );
}