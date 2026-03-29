"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Trash2, Pencil, Scale, Trophy, Search } from "lucide-react";

export default function RubricListPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const assignmentId = params["assignment-id"];

  const [assignment, setAssignment] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rubricRes, assignmentRes] = await Promise.all([
          api.get(`assignments/${assignmentId}/rubric-criteria/`),
          api.get(`assignments/${assignmentId}/`),
        ]);
        setRubrics(rubricRes.data);
        setAssignment(assignmentRes.data);
      } catch (error) {
        console.error("Data fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assignmentId, api]);

  const handleDelete = async (id) => {
    if (!confirm("Permanently remove this grading criterion?")) return;
    try {
      await api.delete(`assignments/${assignmentId}/rubric-criteria/${id}/`);
      setRubrics(rubrics.filter((r) => r.id !== id));
    } catch (error) {
      alert("Delete failed.");
    }
  };
  console.log(rubrics);

  const filteredRubrics = rubrics.filter((r) =>
    r?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalWeight = rubrics.reduce(
    (sum, r) => sum + (parseFloat(r.weight) || 0),
    0,
  );
  const totalPoints = rubrics.reduce(
    (sum, r) => sum + (parseFloat(r.max_points) || 0),
    0,
  );

  const weightComplete = Math.abs(totalWeight - 100) < 0.01;

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={<Trophy size={18} className="text-primary" />}
          label="Total points"
          value={`${totalPoints.toFixed(1)}`}
          unit="pts"
        />

        {assignment?.is_weighted && (
          <StatCard
            icon={
              <Scale
                size={18}
                className={
                  weightComplete ? "text-emerald-500" : "text-amber-500"
                }
              />
            }
            label="Weight allocated"
            value={`${totalWeight.toFixed(1)}`}
            unit="%"
            status={weightComplete ? "success" : "warning"}
            hint={
              weightComplete
                ? "Fully allocated"
                : `${(100 - totalWeight).toFixed(1)}% remaining`
            }
          />
        )}
      </div>

      {/* --- SEARCH --- */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          size={16}
        />
        <input
          type="text"
          placeholder="Search criteria..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-text-muted/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                Criterion
              </th>
              <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-widest text-text-muted text-center">
                Max Points
              </th>
              {assignment?.is_weighted && (
                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-widest text-text-muted text-center">
                  Weight
                </th>
              )}
              <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-widest text-text-muted text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/30">
            {filteredRubrics.length === 0 ? (
              <tr>
                <td
                  colSpan={assignment?.is_weighted ? 4 : 3}
                  className="py-14 text-center text-sm text-text-muted"
                >
                  No criteria match your search.
                </td>
              </tr>
            ) : (
              filteredRubrics.map((r) => (
                <tr
                  key={r.id}
                  className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-accent">
                      {r.name}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 text-primary border border-primary/10 rounded-lg text-xs font-semibold">
                      <Trophy size={11} />
                      {r.max_points}
                    </span>
                  </td>

                  {assignment?.is_weighted && (
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 text-secondary border border-secondary/15 rounded-lg text-xs font-semibold">
                        <Scale size={11} />
                        {r.weight}%
                      </span>
                    </td>
                  )}

                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-0.5">
                      <button
                        onClick={() =>
                          router.push(
                            `dashboard/faculty/${courseId}/assignments/${assignmentId}/rubrics/edit?criteria_id=${r.id}`,
                          )
                        }
                        className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer row count */}
        {filteredRubrics.length > 0 && (
          <div className="px-6 py-3 border-t border-border/40 bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-[11px] text-text-muted">
              {filteredRubrics.length}{" "}
              {filteredRubrics.length === 1 ? "criterion" : "criteria"}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, status, hint }) {
  const isWarning = status === "warning";
  const isSuccess = status === "success";

  return (
    <div
      className={`
      flex items-center gap-4 p-5 rounded-2xl border transition-colors
      ${isWarning ? "bg-amber-50/60 border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20" : ""}
      ${isSuccess ? "bg-emerald-50/60 border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20" : ""}
      ${!isWarning && !isSuccess ? "bg-surface border-border" : ""}
    `}
    >
      <div
        className={`
        p-2.5 rounded-xl border
        ${isWarning ? "bg-amber-100/60 border-amber-200/60 dark:bg-amber-500/20 dark:border-amber-500/30" : ""}
        ${isSuccess ? "bg-emerald-100/60 border-emerald-200/60 dark:bg-emerald-500/20 dark:border-emerald-500/30" : ""}
        ${!isWarning && !isSuccess ? "bg-slate-100 border-border/40" : ""}
      `}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-0.5">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <p
            className={`
            text-2xl font-bold tracking-tight leading-none
            ${isWarning ? "text-amber-600 dark:text-amber-400" : ""}
            ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : ""}
            ${!isWarning && !isSuccess ? "text-accent" : ""}
          `}
          >
            {value}
          </p>
          <span className="text-xs font-semibold text-text-muted">{unit}</span>
        </div>
        {hint && (
          <p className="text-[10px] font-medium text-text-muted/70 mt-0.5 uppercase tracking-wide">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
