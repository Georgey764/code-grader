"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  FileSpreadsheet,
  FileText,
  Users,
  User,
  Scale,
  ExternalLink,
} from "lucide-react";
import {
  buildSingleStudentReportFromMyGrades,
  buildReportCsv,
  buildReportTxt,
  downloadBlob,
} from "@/utils/courseGradeReport";

export default function StudentCourseGradesPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const courseId = params["course-id"];

  const [gradeData, setGradeData] = useState([]);
  const [roster, setRoster] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    (async () => {
      setLoadError(null);
      try {
        const [myRes, rosterRes, courseRes] = await Promise.all([
          api.get(`courses/${courseId}/my-grades/`),
          api.get(`courses/${courseId}/rosters/`),
          api.get(`courses/${courseId}/`),
        ]);
        if (cancelled) return;
        setGradeData(Array.isArray(myRes.data) ? myRes.data : []);
        setCourseName(courseRes.data?.short_name || courseRes.data?.name || "");
        const rList = Array.isArray(rosterRes.data)
          ? rosterRes.data
          : (rosterRes.data?.results ?? []);
        setRoster(rList[0] ?? null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e.response?.data?.detail ||
              "Could not load your grades for this course.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, courseId]);

  const report = useMemo(() => {
    if (!roster) return null;
    return buildSingleStudentReportFromMyGrades(roster, gradeData);
  }, [roster, gradeData]);

  const handleDownloadCsv = () => {
    if (!report) return;
    const csv = buildReportCsv([report], courseName);
    downloadBlob(
      `my-grades-${courseId?.slice(0, 8) || "course"}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
  };

  const handleDownloadTxt = () => {
    if (!report) return;
    const txt = buildReportTxt([report], courseName);
    downloadBlob(
      `my-grades-${courseId?.slice(0, 8) || "course"}.txt`,
      txt,
      "text/plain;charset=utf-8",
    );
  };

  if (loading) return <LoadingPage />;

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-error text-sm">
        {loadError}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted text-sm">
        No enrollment record found for this course.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-border pb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-accent uppercase tracking-tight">
            Your grades
          </h1>
          {courseName && (
            <p className="text-sm text-text-muted mt-1 font-medium">
              {courseName}
            </p>
          )}
          <p className="text-xs text-text-muted mt-3 max-w-2xl leading-relaxed">
            Overall % is the average of per-assignment scores on a 0–100 scale
            (same rules as the instructor grade report: weighted rubrics use
            weights; unweighted use points ÷ rubric max). Group assignments show
            your group&apos;s latest submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
              Course average (graded items)
            </p>
            <p className="text-3xl font-black text-primary tabular-nums mt-1">
              {report.overall != null ? `${report.overall}%` : "—"}
            </p>
            <p className="text-[10px] text-text-muted font-bold mt-1">
              {report.gradedAssignmentCount} of {report.totalAssignments}{" "}
              assignments with rubric grades
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors"
            >
              <FileSpreadsheet size={16} />
              CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
            >
              <FileText size={16} />
              TXT
            </button>
          </div>
        </div>

        <p className="text-[10px] font-mono text-text-muted">
          {report.name} · {report.email}
          {report.cwid ? ` · CWID ${report.cwid}` : ""}
        </p>
      </header>

      <div className="space-y-4">
        {report.assignmentRows.map((ar) => (
          <div
            key={ar.assignmentId}
            className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-subtle"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-accent uppercase tracking-tight flex items-center gap-2">
                  {ar.isGrouped ? (
                    <Users size={16} className="text-secondary" />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                  {ar.assignmentName}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-text-muted">
                    {ar.isGrouped ? "Group" : "Individual"}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-text-muted flex items-center gap-1">
                    <Scale size={10} />
                    {ar.isWeighted ? "Weighted rubric" : "Unweighted rubric"}
                  </span>
                  {ar.isGrouped && ar.groupOrEntityLabel && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-secondary/10 text-secondary">
                      {ar.groupOrEntityLabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-text-muted uppercase">
                  Score
                </p>
                <p className="text-lg font-black text-primary tabular-nums">
                  {ar.percent != null
                    ? `${ar.percent}%`
                    : ar.submission
                      ? "Pending"
                      : "—"}
                </p>
              </div>
            </div>

            {!ar.submission ? (
              <p className="text-xs text-text-muted italic">
                No submission yet
                {ar.isGrouped ? " for your group" : ""}.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
                  <span>
                    Submitted{" "}
                    {new Date(ar.submission.created_at).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  {ar.submission.test_summary && (
                    <span className="font-mono">
                      Tests: {ar.submission.test_summary.passed}/
                      {ar.submission.test_summary.total} passed
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/student/${courseId}/assignments/${ar.assignmentId}`,
                      )
                    }
                    className="inline-flex items-center gap-1 text-primary font-black uppercase tracking-widest hover:underline"
                  >
                    Assignment <ExternalLink size={12} />
                  </button>
                </div>

                {ar.submission.rubric_results?.length ? (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-border">
                        <tr>
                          <th className="px-3 py-2 font-black uppercase tracking-widest text-[9px] text-text-muted">
                            Criterion
                          </th>
                          <th className="px-3 py-2 font-black uppercase tracking-widest text-[9px] text-text-muted text-center w-24">
                            Points
                          </th>
                          {ar.isWeighted && (
                            <th className="px-3 py-2 font-black uppercase tracking-widest text-[9px] text-text-muted text-center w-28">
                              Wt pts
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {ar.submission.rubric_results.map((rr, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-medium text-accent">
                              {rr.criteria_name}
                              {rr.optional_feedback && (
                                <p className="text-[10px] text-text-muted font-normal mt-1 normal-case">
                                  {rr.optional_feedback}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold">
                              {rr.points} / {rr.max_points}
                            </td>
                            {ar.isWeighted && (
                              <td className="px-3 py-2 text-center font-mono text-primary font-black">
                                {rr.weighted_points}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Submitted, but rubric grading is not posted yet.
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
