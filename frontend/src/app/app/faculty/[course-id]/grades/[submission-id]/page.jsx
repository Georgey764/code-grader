"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import ResultsView from "../(helper)/ResultsView";

export default function SubmissionResultsPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const submissionId = params["submission-id"];

  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    const fetchSubmissionResults = async () => {
      setLoading(true);
      try {
        const response = await api.get(`courses/${courseId}/grades/`);
        const assignments = response.data || [];

        let found = null;
        for (const assignment of assignments) {
          const match = assignment?.data?.find((entity) => {
            const id = entity?.submission?.id;
            return id && String(id) === String(submissionId);
          });

          if (match?.submission) {
            found = {
              assignmentId: assignment.assignment_id,
              submission: match.submission,
              studentDetail: match.student_detail,
            };
            break;
          }
        }

        setViewData(found);
      } catch (error) {
        console.error("Fetch submission results error:", error);
        setViewData(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && submissionId) fetchSubmissionResults();
  }, [api, courseId, submissionId]);

  if (loading) return <LoadingPage />;

  if (!viewData) {
    return (
      <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.push(`/app/faculty/${courseId}/grades`)}
            className="px-4 py-2 border border-border text-text-muted font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="border border-border rounded-2xl bg-surface p-6 text-sm">
          Submission not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <ResultsView
        results={viewData.submission?.test_results || []}
        submission={viewData.submission}
        studentDetail={viewData.studentDetail}
        assignmentId={viewData.assignmentId}
        attemptNumber="Latest"
      ></ResultsView>
    </div>
  );
}
