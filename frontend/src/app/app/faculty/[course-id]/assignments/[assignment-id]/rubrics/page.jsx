"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  Trash2,
  Edit3,
  Search,
  Award,
  Scale,
  Info,
  ChevronDown,
} from "lucide-react";

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
    fetchRubrics();
  }, [assignmentId, api]);

  const fetchRubrics = async () => {
    try {
      const response = await api.get(
        `assignments/${assignmentId}/rubric-criteria/`,
      );
      setRubrics(response.data);
      const assignmentResponse = await api.get(`assignments/${assignmentId}/`);
      setAssignment(assignmentResponse.data);
    } catch (error) {
      console.error("Failed to fetch rubric criteria", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this criterion from the rubric?")) return;
    try {
      await api.delete(`assignments/${assignmentId}/rubric-criteria/${id}/`);
      setRubrics(rubrics.filter((r) => r.id !== id));
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const filteredRubrics = rubrics.filter((r) =>
    r?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalWeight = rubrics.reduce(
    (sum, r) => sum + (parseFloat(r.weight) || 0),
    0,
  );

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-[1600px] mx-auto px-4 pb-12 space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 border border-border rounded-xl shadow-subtle">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
            <Scale size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-accent uppercase tracking-tight">
              Grading Rubric
            </h1>
            {assignment.is_weighted && (
              <p className="text-xs text-text-muted font-medium uppercase tracking-widest">
                Total Weight:{" "}
                <span className="text-secondary">
                  {totalWeight.toFixed(2)}%
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={16}
          />
          <input
            type="text"
            placeholder="Search criteria..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-border bg-surface shadow-subtle">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-background text-[10px] font-black uppercase tracking-[0.15em] text-text-muted border-b border-border">
              <th className="p-4 w-64 text-left">Criterion & Weight</th>
              <th className="p-4 border-l border-border/50">Level 1 (Poor)</th>
              <th className="p-4 border-l border-border/50">Level 2</th>
              <th className="p-4 border-l border-border/50">Level 3 (Avg)</th>
              <th className="p-4 border-l border-border/50">Level 4</th>
              <th className="p-4 border-l border-border/50">Level 5 (Exec)</th>
              <th className="p-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRubrics.map((r) => (
              <tr
                key={r.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-4 align-top">
                  <div className="space-y-2">
                    <p className="font-bold text-accent text-sm leading-tight">
                      {r.name}
                    </p>
                    {assignment.is_weighted && (
                      <div className="inline-flex items-center px-2 py-0.5 bg-accent text-white text-[10px] font-black rounded uppercase">
                        ${r.weight}%
                      </div>
                    )}
                  </div>
                </td>
                {[
                  r.desc_one,
                  r.desc_two,
                  r.desc_three,
                  r.desc_four,
                  r.desc_five,
                ].map((desc, idx) => (
                  <td
                    key={idx}
                    className="p-4 text-[11px] leading-relaxed text-text-muted align-top border-l border-border/30 max-w-[200px]"
                  >
                    <div className="line-clamp-6 group-hover:line-clamp-none transition-all">
                      {desc || (
                        <span className="opacity-30 italic">Not defined</span>
                      )}
                    </div>
                  </td>
                ))}
                <td className="p-4 text-right align-top">
                  <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        router.push(
                          `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics/edit?rubric_criteria_id=${r.id}`,
                        )
                      }
                      className="p-2 text-text-muted hover:text-secondary hover:bg-secondary/10 rounded-full transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRubrics.length === 0 && <EmptyState searchTerm={searchTerm} />}
      </div>

      {/* MOBILE/TABLET CARD VIEW */}
      <div className="lg:hidden space-y-6">
        {filteredRubrics.map((r) => (
          <div
            key={r.id}
            className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 bg-background border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-black text-accent uppercase text-sm tracking-tight">
                  {r.name}
                </h3>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  {r.weight}% Weight
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics/edit?rubric_criteria_id=${r.id}`,
                    )
                  }
                  className="p-2 text-text-muted hover:bg-background rounded-lg border border-border"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-error hover:bg-error/5 rounded-lg border border-border"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Mobile Levels Progression */}
            <div className="divide-y divide-border/50">
              {[
                { label: "Level 1 (Poor)", text: r.desc_one },
                { label: "Level 2", text: r.desc_two },
                { label: "Level 3 (Avg)", text: r.desc_three },
                { label: "Level 4", text: r.desc_four },
                { label: "Level 5 (Exec)", text: r.desc_five },
              ].map((level, idx) => (
                <div key={idx} className="p-4 space-y-1">
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">
                    {level.label}
                  </p>
                  <p className="text-xs text-text-main leading-relaxed">
                    {level.text || (
                      <span className="opacity-30 italic text-[10px]">
                        Criterion detail missing
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredRubrics.length === 0 && <EmptyState searchTerm={searchTerm} />}
      </div>

      {/* Footer Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-background border border-dashed border-border rounded-lg">
        <Info className="text-secondary shrink-0" size={18} />
        <p className="text-[11px] text-text-muted leading-relaxed">
          <strong>Note:</strong> Performance levels are weighted linearly. Level
          5 earns the full weight percentage, while Level 1 earns the minimum
          baseline.
        </p>
      </div>
    </div>
  );
}

const EmptyState = ({ searchTerm }) => (
  <div className="p-20 text-center bg-surface">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
      <Award className="text-border" size={32} />
    </div>
    <h3 className="text-sm font-black text-accent uppercase tracking-widest">
      {searchTerm ? "No matches found" : "No Rubric Criteria"}
    </h3>
    <p className="text-xs text-text-muted mt-2 max-w-xs mx-auto">
      {searchTerm
        ? "Try adjusting your filters."
        : "Start building your assessment by adding grading criteria."}
    </p>
  </div>
);
