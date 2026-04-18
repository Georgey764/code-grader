"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Hash,
  User,
  Sparkles,
  Loader2,
  Users,
} from "lucide-react";
import { useMetadata } from "@/context";
import { LoadingPage, CodeReport } from "@/components/ui/sections";
import {
  RubricGradingForm,
  PlagiarismCohortModal,
} from "@/components/graders/sections";

function rowSubmissionGraded(submission, rubricCriteriaCount) {
  if (!submission?.id) return false;
  if (rubricCriteriaCount > 0) {
    return (submission.rubric_results?.length || 0) >= rubricCriteriaCount;
  }
  return Number(submission.total_points || 0) > 0;
}

/** Match gradebook row to the submission being viewed (latest attempt may differ from URL id). */
function findStudentRowIndex(sorted, submission) {
  if (!submission) return -1;
  if (submission.group) {
    const byGroup = sorted.findIndex(
      (row) => String(row.entity_id) === String(submission.group),
    );
    if (byGroup >= 0) return byGroup;
  }
  const byRoster = sorted.findIndex(
    (row) => String(row.entity_id) === String(submission.roster),
  );
  if (byRoster >= 0) return byRoster;
  return sorted.findIndex(
    (row) => String(row.submission?.id) === String(submission.id),
  );
}

/**
 * Walk from `start` in `direction` (+1 or -1) for the first row whose latest submission
 * is not fully graded. `start` is inclusive as the first index to test.
 */
function findFirstUngraded(sorted, rubricCriteriaCount, start, direction) {
  let i = start;
  while (i >= 0 && i < sorted.length) {
    const row = sorted[i];
    const sub = row.submission;
    if (!sub?.id) {
      i += direction;
      continue;
    }
    if (!rowSubmissionGraded(sub, rubricCriteriaCount)) {
      return {
        id: sub.id,
        label: row.student_detail?.full_name || row.entity_name || null,
      };
    }
    i += direction;
  }
  return { id: null, label: null };
}

function buildGradingQueue(gradeData, assignmentId, currentSubmission, rubricCriteriaCount) {
  const block = gradeData.find(
    (a) => String(a.assignment_id) === String(assignmentId),
  );
  if (!block?.data) {
    return {
      nextId: null,
      prevId: null,
      nextLabel: null,
      prevLabel: null,
      index: -1,
      total: 0,
    };
  }
  const withSub = block.data.filter((row) => row.submission?.id);
  const sorted = [...withSub].sort((a, b) => {
    const an = (
      a.student_detail?.full_name ||
      a.entity_name ||
      ""
    ).toLowerCase();
    const bn = (
      b.student_detail?.full_name ||
      b.entity_name ||
      ""
    ).toLowerCase();
    return an.localeCompare(bn);
  });
  const idx = findStudentRowIndex(sorted, currentSubmission);
  const next =
    idx >= 0
      ? findFirstUngraded(sorted, rubricCriteriaCount, idx + 1, 1)
      : findFirstUngraded(sorted, rubricCriteriaCount, 0, 1);
  const prev =
    idx >= 0
      ? findFirstUngraded(sorted, rubricCriteriaCount, idx - 1, -1)
      : findFirstUngraded(
          sorted,
          rubricCriteriaCount,
          sorted.length - 1,
          -1,
        );

  return {
    nextId: next.id,
    prevId: prev.id,
    nextLabel: next.label,
    prevLabel: prev.label,
    index: idx,
    total: sorted.length,
  };
}

export default function Page() {
  const { api, user } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const courseId = params["course-id"];
  const submissionId = params["submission-id"];
  const isFaculty = user?.role === "FA";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [plagiarismModalOpen, setPlagiarismModalOpen] = useState(false);

  const loadPage = useCallback(async () => {
    if (!courseId || !submissionId) return;
    setLoading(true);
    try {
      const submissionResponse = await api.get(
        `assessments/submissions/${submissionId}/`,
      );
      const submission = submissionResponse.data;
      const [gradesResponse, rosterResponse, assignmentResponse] =
        await Promise.all([
          api.get(`courses/${courseId}/grades/`),
          api.get(`courses/${courseId}/rosters/${submission.roster}/`),
          api.get(`assignments/${submission.assignment}/`),
        ]);

      const gradeData = gradesResponse.data ?? [];
      const rubricCriteriaCount =
        assignmentResponse.data?.rubric_criterias?.length ?? 0;

      const queue = buildGradingQueue(
        gradeData,
        submission.assignment,
        submission,
        rubricCriteriaCount,
      );

      setData({
        results: submission.test_results,
        assignmentId: submission.assignment,
        submission,
        rubricCriteriaCount,
        attemptNumber: "Latest",
        studentDetail: {
          full_name:
            rosterResponse.data.student_profile.user.first_name +
            " " +
            rosterResponse.data.student_profile.user.last_name,
          email: rosterResponse.data.student_profile.user.email,
        },
        queue,
      });
    } catch (error) {
      console.error("Fetch submission results error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [api, courseId, submissionId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    setAiResult(null);
  }, [submissionId]);

  const runAiAuthorshipCheck = async () => {
    if (!submissionId) return;
    setAiLoading(true);
    try {
      const { data: res } = await api.post(
        `ai-detector/submissions/${submissionId}/analyze/`,
      );
      setAiResult(res);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not analyze submission.";
      alert(msg);
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };

  const refreshSubmissionOnly = useCallback(async () => {
    if (!submissionId || !courseId) return;
    try {
      const [submissionResponse, gradesResponse] = await Promise.all([
        api.get(`assessments/submissions/${submissionId}/`),
        api.get(`courses/${courseId}/grades/`),
      ]);
      const sub = submissionResponse.data;
      const gradeData = gradesResponse.data ?? [];
      setData((prev) => {
        if (!prev) return prev;
        const queue = buildGradingQueue(
          gradeData,
          prev.assignmentId,
          sub,
          prev.rubricCriteriaCount ?? 0,
        );
        return {
          ...prev,
          submission: sub,
          results: sub.test_results,
          queue,
        };
      });
    } catch (e) {
      console.error(e);
    }
  }, [api, submissionId, courseId]);

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

  const { queue } = data;
  const positionLabel =
    queue.index >= 0 && queue.total > 0
      ? `${queue.index + 1} / ${queue.total} with submissions`
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      {isFaculty ? (
        <PlagiarismCohortModal
          open={plagiarismModalOpen}
          onClose={() => setPlagiarismModalOpen(false)}
          submissionId={submissionId}
          api={api}
        />
      ) : null}
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/faculty/${courseId}/grades`)}
              className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Gradebook
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">
                {data.studentDetail?.full_name || "Student result"}
              </h2>
              {positionLabel ? (
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {positionLabel}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
              <span className="flex items-center gap-1">
                <Hash size={12} className="text-secondary" />{" "}
                {data.attemptNumber} attempt
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {queue.prevId ? (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/faculty/${courseId}/grades/${queue.prevId}`,
                  )
                }
                className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 active:scale-[0.98] transition-all font-black uppercase tracking-widest text-[10px]"
              >
                <ChevronLeft size={16} />
                Previous
                {queue.prevLabel ? (
                  <span className="font-bold normal-case tracking-normal text-xs max-w-[120px] truncate">
                    {queue.prevLabel}
                  </span>
                ) : null}
              </button>
            ) : (
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 py-2 text-center sm:text-left sm:max-w-[140px]">
                No previous ungraded
              </span>
            )}
            {queue.nextId ? (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/faculty/${courseId}/grades/${queue.nextId}`,
                  )
                }
                className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all font-black uppercase tracking-widest text-[10px]"
              >
                Next student
                <ChevronRight size={16} />
                {queue.nextLabel ? (
                  <span className="font-bold normal-case tracking-normal text-xs max-w-[140px] truncate">
                    {queue.nextLabel}
                  </span>
                ) : null}
              </button>
            ) : (
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 py-2 text-center sm:text-left sm:max-w-[160px]">
                No next ungraded
              </span>
            )}
          </div>
        </div>

        {isFaculty ? (
          <section
            className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-subtle"
            aria-label="AI authorship check"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  AI authorship signal
                </h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mt-1 max-w-xl">
                  Statistical model on submitted code — advisory only, not proof of
                  misconduct.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlagiarismModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-primary text-primary bg-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  <Users size={16} />
                  Cohort plagiarism
                </button>
                <button
                  type="button"
                  onClick={runAiAuthorshipCheck}
                  disabled={aiLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {aiLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {aiLoading ? "Running model…" : "Run check"}
                </button>
              </div>
            </div>
            {aiResult ? (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 ${
                  aiResult.prediction === "ai"
                    ? "border-amber-200 bg-amber-50 text-amber-950"
                    : aiResult.prediction === "human"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : "border-border bg-slate-50 text-text-muted"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                  Result
                </p>
                <p className="text-sm font-black leading-snug">
                  {aiResult.prediction === "ai"
                    ? "Model suggests: likely AI-assisted or AI-generated style"
                    : aiResult.prediction === "human"
                      ? "Model suggests: more consistent with typical human-written code"
                      : aiResult.summary}
                </p>
                {aiResult.prediction === "ai" || aiResult.prediction === "human" ? (
                  <p className="text-xs font-bold mt-2 opacity-90">
                    {aiResult.summary}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <RubricGradingForm
          submission={data.submission}
          assignmentId={data.assignmentId}
          subtitle={data.studentDetail?.full_name}
          onSaved={refreshSubmissionOnly}
        />

        <CodeReport
          submission={data.submission}
          assignmentId={data.assignmentId}
        />
      </div>
    </div>
  );
}
