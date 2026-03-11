"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { BackButton } from "@/components/ui/elements";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  Award,
  FileText,
  AlignLeft,
  MoreVertical,
} from "lucide-react";

export default function RubricListPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const assignmentId = params["assignment-id"];

  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRubrics();
  }, [assignmentId, api]);

  const fetchRubrics = async () => {
    try {
      // Endpoint based on schema: RubricCriteria
      const response = await api.get(
        `assignments/${assignmentId}/rubric-criteria/`,
      );
      setRubrics(response.data);
    } catch (error) {
      console.error("Failed to fetch rubric criteria", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this criterion?")) return;
    try {
      await api.delete(`assignments/${assignmentId}/rubric-criteria/${id}/`);
      setRubrics(rubrics.filter((r) => r.id !== id));
    } catch (error) {
      alert("Failed to delete rubric criterion.");
    }
  };

  const filteredRubrics = rubrics.filter(
    (r) =>
      r?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r?.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPoints = rubrics.reduce(
    (sum, r) => sum + (parseFloat(r.max_points) || 0),
    0,
  );

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Filter Bar */}
      <div className="mb-6 relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search rubric names or descriptions..."
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none text-body shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MOBILE VIEW (Cards) */}
      <div className="space-y-4 md:hidden">
        {filteredRubrics.map((r) => (
          <div
            key={r.id}
            className="bg-surface border border-border rounded-lg p-5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-accent uppercase tracking-tight leading-tight">
                  {r.name}
                </h4>
                <div className="inline-flex items-center mt-1 px-2 py-0.5 bg-secondary/10 border border-secondary/20 rounded text-[10px] font-bold text-secondary uppercase">
                  Max: {r.max_points} pts
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() =>
                    router.push(
                      `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics/edit?rubric_criteria_id=${r.id}`,
                    )
                  }
                  className="cursor-pointer p-2 text-text-muted hover:bg-slate-100 rounded-full"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="cursor-pointer p-2 text-error hover:bg-red-50 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
              {r.description || "No description provided."}
            </p>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW (Table) */}
      <div className="hidden md:block bg-surface rounded-md border border-border shadow-subtle overflow-hidden">
        {filteredRubrics.length > 0 ? (
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="p-4 text-subheading text-[10px] w-1/4">
                  Criterion Name
                </th>
                <th className="p-4 text-subheading text-[10px] w-2/4">
                  Description
                </th>
                <th className="p-4 text-subheading text-[10px] w-1/6 text-center">
                  Max Points
                </th>
                <th className="p-4 text-subheading text-[10px] w-32 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRubrics.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/5 text-primary rounded">
                        <FileText size={16} />
                      </div>
                      <span className="font-bold text-accent text-sm tracking-tight">
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {r.description || (
                        <span className="italic opacity-50 underline decoration-dotted">
                          No description set
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-3 py-1 bg-secondary text-white text-[11px] font-black rounded-sm shadow-sm">
                      {r.max_points}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() =>
                          router.push(
                            `/app/faculty/${courseId}/assignments/${assignmentId}/rubrics/edit?rubric_criteria_id=${r.id}`,
                          )
                        }
                        className="cursor-pointer p-2 text-text-muted hover:text-secondary hover:bg-secondary/10 rounded-full transition-all"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="cursor-pointer p-2 text-text-muted hover:text-error hover:bg-red-50 rounded-full transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </div>

      {/* Empty State for Mobile */}
      <div className="md:hidden">
        {filteredRubrics.length === 0 && <EmptyState searchTerm={searchTerm} />}
      </div>

      {/* Footer Strategy Note */}
      <div className="mt-8 p-6 bg-secondary/5 border border-secondary/20 rounded-md">
        <div className="flex gap-4">
          <div className="mt-1">
            <AlignLeft className="text-secondary" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">
              Grading Strategy
            </h4>
            <p className="text-xs text-text-main leading-relaxed">
              These criteria are used to generate the final grade for student
              submissions. Ensure the <strong>Total Weight</strong> aligns with
              the assignment&lsquo;s maximum possible points to avoid grading
              discrepancies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const EmptyState = ({ searchTerm }) => (
  <div className="p-16 text-center bg-surface border border-border rounded-md">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
      <Award className="text-border" size={32} />
    </div>
    <h3 className="text-body font-bold text-accent">No criteria defined</h3>
    <p className="text-caption max-w-xs mx-auto mt-2">
      {searchTerm
        ? "No rubrics match your search."
        : "Build your grading rubric by adding your first criterion above."}
    </p>
  </div>
);
