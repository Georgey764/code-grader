"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  Users,
  User,
  Scale,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  buildStudentReports,
  fetchRosterToGroupMaps,
  buildReportCsv,
  buildReportTxt,
  downloadBlob,
} from "@/utils/courseGradeReport";

export default function CourseGradeReportPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();
  const courseId = params["course-id"];

  const [gradeData, setGradeData] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [groupMaps, setGroupMaps] = useState({});
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [openIds, setOpenIds] = useState(() => new Set());

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    (async () => {
      setLoadError(null);
      try {
        const [gradesRes, rosterRes, courseRes] = await Promise.all([
          api.get(`courses/${courseId}/grades/`),
          api.get(`courses/${courseId}/rosters/`),
          api.get(`courses/${courseId}/`),
        ]);
        if (cancelled) return;
        const g = gradesRes.data || [];
        setGradeData(g);
        setCourseName(courseRes.data?.short_name || courseRes.data?.name || "");

        const rList = Array.isArray(rosterRes.data)
          ? rosterRes.data
          : (rosterRes.data?.results ?? []);
        setRosters(rList);

        const maps = await fetchRosterToGroupMaps(api, g);
        if (cancelled) return;
        setGroupMaps(maps);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e.response?.data?.detail || "Could not load grade report data.",
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

  const reports = useMemo(
    () => buildStudentReports(rosters, gradeData, groupMaps),
    [rosters, gradeData, groupMaps],
  );

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.cwid.toLowerCase().includes(q),
    );
  }, [reports, search]);

  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadCsv = () => {
    const csv = buildReportCsv(reports, courseName);
    downloadBlob(
      `grade-report-${courseId?.slice(0, 8) || "course"}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
  };

  const handleDownloadTxt = () => {
    const txt = buildReportTxt(reports, courseName);
    downloadBlob(
      `grade-report-${courseId?.slice(0, 8) || "course"}.txt`,
      txt,
      "text/plain;charset=utf-8",
    );
  };

  if (loading) return <LoadingPage />;

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-error">
        {loadError}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-accent uppercase tracking-tight">
            Course grade report
          </h1>
          {courseName && (
            <p className="text-sm text-text-muted mt-1 font-medium">
              {courseName}
            </p>
          )}
          <p className="text-xs text-text-muted mt-3 max-w-3xl leading-relaxed">
            Overall % is the average of per-assignment scores on a 0–100 scale.
            Weighted assignments use rubric weights (same as the gradebook).
            Unweighted assignments use earned points ÷ sum of rubric max points.
            Group assignments use each student&apos;s group&apos;s latest
            submission.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={14}
            />
            <input
              type="search"
              placeholder="Search student name, email, CWID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors"
            >
              <FileSpreadsheet size={16} />
              Download CSV (full roster)
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
            >
              <FileText size={16} />
              Download TXT (full roster)
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <p className="text-sm text-text-muted py-12 text-center border border-dashed border-border rounded-xl">
            No students match your search, or the roster is empty.
          </p>
        ) : (
          filteredReports.map((st) => {
            const isOpen = openIds.has(st.rosterId);
            return (
              <div
                key={st.rosterId}
                className="border border-border rounded-2xl bg-surface shadow-subtle overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(st.rosterId)}
                  className={`w-full flex items-center justify-between gap-4 p-5 text-left transition-colors ${isOpen ? "bg-primary/5" : "hover:bg-slate-50/80"}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black text-accent uppercase tracking-tight truncate">
                      {st.name}
                    </p>
                    <p className="text-[10px] font-mono text-text-muted truncate">
                      {st.email}
                      {st.cwid ? ` · CWID ${st.cwid}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                        Overall
                      </p>
                      <p className="text-xl font-black text-primary tabular-nums">
                        {st.overall != null ? `${st.overall}%` : "—"}
                      </p>
                      <p className="text-[9px] text-text-muted font-bold">
                        {st.gradedAssignmentCount}/{st.totalAssignments} graded
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="text-primary" size={22} />
                    ) : (
                      <ChevronDown className="text-text-muted" size={22} />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-5 space-y-6 bg-slate-50/40 animate-in slide-in-from-top-1">
                    {st.assignmentRows.map((ar) => (
                      <div
                        key={ar.assignmentId}
                        className="rounded-xl border border-border bg-white p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-black text-accent uppercase tracking-tight flex items-center gap-2">
                              {ar.isGrouped ? (
                                <Users size={16} className="text-secondary" />
                              ) : (
                                <User size={16} className="text-primary" />
                              )}
                              {ar.assignmentName}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-text-muted">
                                {ar.isGrouped ? "Group" : "Individual"}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-text-muted flex items-center gap-1">
                                <Scale size={10} />
                                {ar.isWeighted
                                  ? "Weighted rubric"
                                  : "Unweighted rubric"}
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
                              Assignment score
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
                            No submission on record for this student
                            {ar.isGrouped ? " (or not placed in a group)" : ""}.
                          </p>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
                              <span>
                                Submitted{" "}
                                {new Date(
                                  ar.submission.created_at,
                                ).toLocaleString([], {
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
                                    `/dashboard/faculty/${courseId}/grades/${ar.submission.id}`,
                                  )
                                }
                                className="inline-flex items-center gap-1 text-primary font-black uppercase tracking-widest hover:underline"
                              >
                                Open in gradebook <ExternalLink size={12} />
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
                                    {ar.submission.rubric_results.map(
                                      (rr, idx) => (
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
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                Submission exists but no rubric results yet.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
