"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Hash, Trophy, User } from "lucide-react";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { CodeReport } from "@/components/ui/sections";
import { GradingModal } from "@/components/graders/sections";

export default function Page() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const courseId = params["course-id"];
  const submissionId = params["submission-id"];
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [openGradingModal, setOpenGradingModal] = useState(false);

  useEffect(() => {
    const fetchSubmissionResults = async () => {
      setLoading(true);
      try {
        const submissionResponse = await api.get(
          `assessments/submissions/${submissionId}/`,
        );

        const rosterResponse = await api.get(
          `courses/${courseId}/rosters/${submissionResponse.data.roster}/`,
        );
        setData({
          results: submissionResponse.data.test_results,
          assignmentId: submissionResponse.data.assignment,
          submission: submissionResponse.data,
          attemptNumber: "Latest",
          studentDetail: {
            full_name:
              rosterResponse.data.student_profile.user.first_name +
              " " +
              rosterResponse.data.student_profile.user.last_name,
            email: rosterResponse.data.student_profile.user.email,
          },
        });
      } catch (error) {
        console.error("Fetch submission results error:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && submissionId) fetchSubmissionResults();
  }, []);

  if (loading) return <LoadingPage />;

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.push(`/dashboard/faculty/${courseId}/grades`)}
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
      <div className="space-y-6 animate-in fade-in duration-500">
        {openGradingModal && (
          <GradingModal
            submission={data.submission}
            assignmentId={data.assignmentId}
            onClose={() => setOpenGradingModal(false)}
          />
        )}
        {/* --- GLANCEABLE HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          {/* Left Side: Identity & Core Stats */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">
                {data.studentDetail?.full_name || "Student Result"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
              <span className="flex items-center gap-1">
                <Hash size={12} className="text-secondary" />{" "}
                {data.attemptNumber} Attempt
              </span>
              <span className="flex items-center gap-1">
                <User size={12} /> {data.studentDetail?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />{" "}
                {new Date(data.submission?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Right Side: Action Buttons (Locked together) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOpenGradingModal(true)}
              className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded shadow-lg hover:brightness-110 active:scale-[0.98] transition-all group font-black uppercase tracking-widest text-xs"
            >
              <Trophy size={14} /> Grade
            </button>
          </div>
        </div>

        <CodeReport
          results={data.results}
          submission={data.submission}
          assignmentId={data.assignmentId}
        />
      </div>
    </div>
  );
}
