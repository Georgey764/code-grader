"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Search, ArrowLeft, Scale } from "lucide-react";

import AssignmentAccordion from "./(helper)/AssignmentAccordion";
import ResultsView from "./(helper)/ResultsView";
import GradingModal from "./(helper)/GradingModal";

export default function GradebookPage() {
  const { api } = useMetadata();
  const params = useParams();
  const courseId = params["course-id"];

  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAssignment, setOpenAssignment] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [gradingSub, setGradingSub] = useState(null);

  const fetchGrades = async () => {
    try {
      const response = await api.get(`courses/${courseId}/grades/`);
      setGradeData(response.data);
      if (response.data.length > 0 && !openAssignment)
        setOpenAssignment(response.data[0].assignment_id);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchGrades();
  }, [courseId]);

  if (loading) return <LoadingPage />;

  if (activeRow) {
    return (
      <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
        <ResultsView
          results={activeRow.submission?.test_results || []}
          submission={activeRow.submission}
          studentDetail={activeRow.student_detail}
          attemptNumber="Latest"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGradingSub(activeRow.submission)}
              className="px-4 py-2 bg-accent text-white font-black uppercase text-[10px] tracking-widest rounded-lg shadow hover:brightness-110 flex items-center gap-2"
            >
              <Scale size={14} />{" "}
              {activeRow.submission?.total_points > 0 ? "Edit" : "Grade"}
            </button>
            <button
              onClick={() => {
                setActiveRow(null);
                fetchGrades();
              }}
              className="px-4 py-2 border border-border text-text-muted font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </ResultsView>
        {gradingSub && (
          <GradingModal
            submission={gradingSub}
            assignmentId={activeRow.assignment_id}
            onClose={() => setGradingSub(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 pb-5">
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
              setActiveRow({ ...row, assignment_id: assignment.assignment_id });
            }}
          />
        ))}
      </div>
    </div>
  );
}
