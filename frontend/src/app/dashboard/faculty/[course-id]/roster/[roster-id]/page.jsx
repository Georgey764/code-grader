"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  ArrowLeft,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Trophy,
  ClipboardCheck,
  CircleDashed,
} from "lucide-react";

export default function StudentResultsPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const rosterId = params["roster-id"];

  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [assignmentData, setAssignmentData] = useState([]);

  useEffect(() => {
    const fetchStudentPerformance = async () => {
      try {
        const rosterRes = await api.get(
          `courses/${courseId}/rosters/${rosterId}/`,
        );
        setStudentInfo(rosterRes.data);

        const assignmentsRes = await api.get(
          `assignments/?course_id=${courseId}`,
        );
        const assignments = assignmentsRes.data;

        const performanceRecords = await Promise.all(
          assignments.map(async (asn) => {
            try {
              // Fetch submissions filtered by roster_id
              const subRes = await api.get(
                `assessments/submissions/?assignment_id=${asn.id}&roster_id=${rosterId}`,
              );
              return {
                ...asn,
                latest: subRes.data[0] || null,
              };
            } catch (e) {
              return { ...asn, latest: null };
            }
          }),
        );

        setAssignmentData(performanceRecords);
      } catch (err) {
        console.error("Failed to load student performance", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && rosterId) fetchStudentPerformance();
  }, [api, courseId, rosterId]);

  if (loading) return <LoadingPage />;

  // --- Grading Logic Calculations ---
  const stats = assignmentData.reduce(
    (acc, item) => {
      const sub = item.latest;
      const criteriaCount = item.rubric_criterias?.length || 0; //
      const gradedCount = sub?.rubric_results?.length || 0; //

      if (sub) {
        if (criteriaCount > 0 && gradedCount >= criteriaCount) {
          acc.graded++;
        } else {
          acc.ungraded++;
        }
      } else {
        acc.unsubmitted++;
      }
      return acc;
    },
    { graded: 0, ungraded: 0, unsubmitted: 0 },
  );

  const user = studentInfo?.student_profile?.user;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in duration-500">
      {/* 1. Header & Student Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-accent uppercase tracking-tight leading-none">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-xs text-text-muted font-mono mt-2 uppercase">
                CWID: {user?.cwid} • ID: {rosterId.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        {/* --- Summary Stats Cards --- */}
        <div className="flex gap-4">
          <StatCard
            label="Fully Graded"
            value={stats.graded}
            icon={<CheckCircle2 className="text-green-600" size={16} />}
          />
          <StatCard
            label="Pending Grade"
            value={stats.ungraded}
            icon={<CircleDashed className="text-amber-500" size={16} />}
          />
          <StatCard
            label="Not Submitted"
            value={stats.unsubmitted}
            icon={<AlertCircle className="text-error" size={16} />}
          />
        </div>
      </div>

      {/* 2. Assignment Performance Table */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                Assignment
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                Submission
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                Evaluation
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {assignmentData.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-accent uppercase tracking-tight">
                      {record.name}
                    </p>
                    <p className="text-[10px] text-text-muted flex items-center gap-2 font-bold uppercase">
                      <Clock size={12} /> Due:{" "}
                      {new Date(record.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <SubmissionStatus sub={record.latest} />
                </td>
                <td className="px-6 py-5">
                  <GradingStatus
                    sub={record.latest}
                    criteriaCount={record.rubric_criterias?.length || 0}
                  />
                </td>
                <td className="px-6 py-5 text-right">
                  {record.latest ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/faculty/${courseId}/assignments/${record.id}/submissions/view?roster_id=${rosterId}`,
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded shadow-md hover:bg-accent transition-all"
                    >
                      View Report <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-30">
                      No Data
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** * --- UI Helpers --- */

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface border border-border p-4 rounded-xl min-w-[140px] shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-accent">{value}</p>
    </div>
  );
}

function SubmissionStatus({ sub }) {
  if (!sub)
    return (
      <span className="text-[10px] font-black uppercase text-text-muted/40">
        ---
      </span>
    );

  const colors = {
    COMPLETE: "text-green-600",
    PROCESSING: "text-amber-500",
    PENDING: "text-blue-500",
    INCOMPLETE: "text-error",
  };

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center gap-1.5 ${colors[sub.status]} text-[10px] font-black uppercase tracking-widest`}
      >
        {sub.status}
      </span>
      <p className="text-[9px] text-text-muted font-bold uppercase">
        {sub.test_results?.length || 0} Auto-Tests
      </p>
    </div>
  );
}

function GradingStatus({ sub, criteriaCount }) {
  if (!sub)
    return (
      <span className="text-[10px] font-black uppercase text-error tracking-widest">
        Unsubmitted
      </span>
    );
  if (criteriaCount === 0)
    return (
      <span className="text-[10px] font-black uppercase text-text-muted tracking-widest italic opacity-50">
        No Rubric
      </span>
    );

  const gradedCount = sub?.rubric_results?.length || 0; //

  if (gradedCount === 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-600 text-[10px] font-black uppercase tracking-widest">
        <CircleDashed size={12} /> Ungraded
      </span>
    );

  if (gradedCount < criteriaCount)
    return (
      <span className="inline-flex items-center gap-1.5 text-secondary text-[10px] font-black uppercase tracking-widest">
        Partial ({gradedCount}/{criteriaCount})
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest">
      <ClipboardCheck size={12} /> Graded
    </span>
  );
}
