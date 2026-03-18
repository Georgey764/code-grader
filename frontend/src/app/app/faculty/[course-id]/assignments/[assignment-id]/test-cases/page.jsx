"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  Trash2,
  Edit3,
  EyeOff,
  Eye,
  Clock,
  Hash,
  Search,
  ShieldCheck,
  ChevronRight,
  FileText,
} from "lucide-react";

export default function TestCasesListPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const assignmentId = params["assignment-id"];

  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTestCases();
  }, [assignmentId, api]);

  const fetchTestCases = async () => {
    try {
      const response = await api.get(`assignments/${assignmentId}/test-cases/`);
      setTestCases(response.data);
    } catch (error) {
      console.error("Failed to fetch test cases", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this test case?")) return;
    try {
      await api.delete(`assignments/${assignmentId}/test-cases/${id}/`);
      setTestCases(testCases.filter((tc) => tc.id !== id));
    } catch (error) {
      alert("Failed to delete test case.");
    }
  };

  const filteredCases = testCases.filter((tc) => {
    const inputContent = tc?.text_input ?? "";
    return (
      inputContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tc?.expected_output ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Search & Filter Bar */}
      <div className="mb-6 relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by input or output content..."
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-md focus:ring-2 focus:ring-secondary outline-none text-body shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MOBILE VIEW (Cards) - Shown on small screens, hidden on md+ */}
      <div className="space-y-4 md:hidden">
        {filteredCases.map((tc) => (
          <div
            key={tc.id}
            className="bg-surface border border-border rounded-lg p-4 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />

            <div className="flex justify-between items-start mb-3">
              <VisibilityBadge isHidden={tc.is_hidden} />
              <div className="flex space-x-1">
                <button
                  onClick={() =>
                    router.push(
                      `/app/faculty/${courseId}/assignments/${assignmentId}/test-cases/edit?test_case_id=${tc.id}`,
                    )
                  }
                  className="cursor-pointer p-2 text-text-muted hover:bg-slate-100 rounded-full"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(tc.id)}
                  className="cursor-pointer p-2 text-error hover:bg-red-50 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">
                  Input Snippet
                </span>

                {tc.file_input ? (
                  <a
                    href={tc.file_input}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm cursor-pointer text-blue-500 hover:underline"
                  >
                    <FileText size={16} />
                    <span className="text-sm cursor-pointer ">View Input</span>
                  </a>
                ) : (
                  <code className="block bg-background p-2 rounded text-xs font-mono mt-1 border border-border/50 truncate">
                    {tc.text_input != null && tc.text_input !== ""
                      ? tc.text_input
                      : "Empty"}
                  </code>
                )}
              </div>
              <div className="flex justify-end items-center bg-slate-50 p-2 rounded border border-dashed border-border">
                <div className="flex items-center text-xs text-text-muted">
                  <Clock size={14} className="mr-1" /> {tc.time_limit}ms
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW (Table) - Hidden on small screens, shown on md+ */}
      <div className="hidden md:block bg-surface rounded-md border border-border shadow-subtle overflow-hidden">
        {filteredCases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="w-32 p-4 text-subheading text-[10px]">
                    Visibility
                  </th>
                  <th className="p-4 text-subheading text-[10px]">
                    Sample Input
                  </th>
                  <th className="p-4 text-subheading text-[10px]">
                    Expected Output
                  </th>
                  <th className="w-40 p-4 text-subheading text-[10px]">
                    Time Limit
                  </th>
                  <th className="w-28 p-4 text-subheading text-[10px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((tc) => (
                  <tr
                    key={tc.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <VisibilityBadge isHidden={tc.is_hidden} />
                    </td>

                    <td className="p-4 overflow-hidden">
                      {tc.file_input ? (
                        <a
                          href={tc.file_input}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm cursor-pointer text-blue-500 hover:underline"
                        >
                          <FileText size={16} />
                          <span className="text-sm cursor-pointer ">
                            View Input
                          </span>
                        </a>
                      ) : (
                        <code className="text-[11px] bg-background p-1.5 rounded block truncate font-mono text-code-string border border-border/50">
                          {tc.text_input != null && tc.text_input !== "" ? (
                            tc.text_input
                          ) : (
                            <span className="italic opacity-50">Empty</span>
                          )}
                        </code>
                      )}
                    </td>
                    <td className="p-4 overflow-hidden">
                      <code className="text-[11px] bg-background p-1.5 rounded block truncate font-mono text-primary font-bold border border-border/50">
                        {tc.expected_output}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-[11px] text-text-muted">
                          <Clock size={12} className="mr-1" /> {tc.time_limit}ms
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() =>
                            router.push(
                              `/app/faculty/${courseId}/assignments/${assignmentId}/test-cases/edit?test_case_id=${tc.id}`,
                            )
                          }
                          className="cursor-pointer p-2 text-text-muted hover:text-secondary hover:bg-secondary/10 rounded-full transition-all"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(tc.id)}
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
          </div>
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </div>

      {/* Empty State for Mobile (Hidden if data exists) */}
      <div className="md:hidden">
        {filteredCases.length === 0 && <EmptyState searchTerm={searchTerm} />}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-background border border-border rounded-md border-dashed">
        <p className="text-[11px] text-text-muted leading-relaxed">
          <strong className="text-accent uppercase mr-2">Note:</strong>
          Hidden test cases are used for final grading. Public test cases are
          visible to students for debugging.
        </p>
      </div>
    </div>
  );
}

/* Helper Components to keep the main code clean */

const VisibilityBadge = ({ isHidden }) =>
  isHidden ? (
    <span className="inline-flex items-center text-error font-bold text-[10px] uppercase tracking-tighter">
      <EyeOff size={14} className="mr-1.5" /> Hidden
    </span>
  ) : (
    <span className="inline-flex items-center text-secondary font-bold text-[10px] uppercase tracking-tighter">
      <Eye size={14} className="mr-1.5" /> Public
    </span>
  );

const EmptyState = ({ searchTerm }) => (
  <div className="p-16 text-center bg-surface border border-border rounded-md">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
      <ShieldCheck className="text-border" size={32} />
    </div>
    <h3 className="text-body font-bold">No test cases found</h3>
    <p className="text-caption max-w-xs mx-auto mt-2">
      {searchTerm
        ? "Try adjusting your search terms."
        : "Start by adding your first automated test case."}
    </p>
  </div>
);
