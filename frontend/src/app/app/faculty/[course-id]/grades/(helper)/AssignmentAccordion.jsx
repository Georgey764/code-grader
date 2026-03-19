"use client";

import React, { useState } from "react";
import {
  Users,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Beaker,
} from "lucide-react";

export default function AssignmentAccordion({
  assignment,
  isOpen,
  toggle,
  searchTerm,
  onSelect,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalEnrolled = assignment.data.length;
  const gradedCount = assignment.data.filter(
    (i) => i.submission && i.submission.total_points > 0,
  ).length;
  const needsGrading = assignment.data.filter(
    (i) => i.submission && i.submission.total_points === 0,
  ).length;
  const progress = totalEnrolled > 0 ? (gradedCount / totalEnrolled) * 100 : 0;

  const filteredData = assignment.data.filter((item) => {
    const s = searchTerm.toLowerCase();
    return (
      item.entity_name.toLowerCase().includes(s) ||
      item.student_detail?.full_name?.toLowerCase().includes(s) ||
      item.student_detail?.username?.toLowerCase().includes(s)
    );
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="border border-border rounded-2xl bg-surface shadow-subtle overflow-hidden">
      <button
        onClick={toggle}
        className={`w-full p-5 flex items-center justify-between transition-colors ${isOpen ? "bg-slate-50/50" : "hover:bg-slate-50/30"}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${assignment.is_grouped ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}
          >
            {assignment.is_grouped ? <Users size={20} /> : <User size={20} />}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black text-accent uppercase tracking-tight">
              {assignment.assignment_name}
            </h3>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                {gradedCount}/{totalEnrolled} Graded
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {needsGrading > 0 && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 animate-pulse">
              <AlertCircle size={12} /> {needsGrading} Left
            </span>
          )}
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border animate-in fade-in slide-in-from-top-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-text-muted border-b border-border">
              <tr className="text-sm">
                <th className="p-4 pl-8">Student Identification</th>
                <th className="p-4 text-center">Diagnostics</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Final Score</th>
                <th className="p-4 pr-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {paginatedData.map((row) => {
                const sub = row.submission;
                const isGraded = sub && sub.total_points > 0;
                return (
                  <tr
                    key={row.entity_id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="p-4 pl-8">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-accent">
                          {row.student_detail?.full_name || row.entity_name}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">
                          {row.student_detail?.email ||
                            `ID: ${row.entity_id.slice(0, 8)}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {sub?.test_summary ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-500">
                          <Beaker size={10} /> {sub.test_summary.passed}/
                          {sub.test_summary.total}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {!sub ? (
                          <span className="text-[9px] font-bold text-text-muted opacity-30 italic">
                            No Submission
                          </span>
                        ) : isGraded ? (
                          <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                            Graded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-black text-sm">
                      <span
                        className={
                          isGraded
                            ? "text-accent"
                            : "text-text-muted opacity-20"
                        }
                      >
                        {isGraded
                          ? `${sub.total_points} ${assignment.is_weighted ? "%" : "pts"}`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="p-4 pr-8 text-right">
                      {sub && (
                        <button
                          onClick={() => onSelect(row)}
                          className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isGraded ? "bg-white border border-border text-text-muted" : "bg-accent text-white shadow-lg"}`}
                        >
                          {isGraded ? "Review" : "View Submission"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 flex items-center justify-between border-t border-border bg-slate-50/30">
            <span className="text-[10px] font-black text-text-muted uppercase">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 border border-border rounded-lg bg-white disabled:opacity-20"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 border border-border rounded-lg bg-white disabled:opacity-20"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
