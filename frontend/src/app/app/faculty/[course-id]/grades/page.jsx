"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Search } from "lucide-react";

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
      </div>
    </div>
  );
}