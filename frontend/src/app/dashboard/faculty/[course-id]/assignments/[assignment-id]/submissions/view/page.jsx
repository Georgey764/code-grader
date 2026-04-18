"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Hash,
  InboxIcon,
  Calendar,
  ChevronRight,
  CircleDashed,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function SubmissionsPage() {
  const param = useParams();
  const assignmentId = param["assignment-id"];
  const { api, user } = useMetadata();
  const isFaculty = user?.role === "FA";
  const [aiBySubmission, setAiBySubmission] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const searchParams = useSearchParams();
  const rosterId = searchParams.get("roster_id");
  const groupId = searchParams.get("group_id");

  const [submissions, setSubmissions] = useState([]);
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const courseId = param["course-id"];

  const fetchPageData = async () => {
    try {
      let url_call = `assessments/submissions/?assignment_id=${assignmentId}`;
      if (rosterId) url_call += `&roster_id=${rosterId}`;
      if (groupId) url_call += `&group_id=${groupId}`;

      const [subRes, assignRes] = await Promise.all([
        api.get(url_call),
        api.get(`assignments/${assignmentId}/`),
      ]);

      setSubmissions([...subRes?.data]);
      setAssignmentData(assignRes?.data);
    } catch (err) {
      console.error("Error fetching page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [api, assignmentId, groupId, rosterId]);

  const runAiCheck = async (subId, e) => {
    e?.stopPropagation?.();
    setAiLoading((m) => ({ ...m, [subId]: true }));
    try {
      const { data } = await api.post(
        `ai-detector/submissions/${subId}/analyze/`,
      );
      setAiBySubmission((m) => ({ ...m, [subId]: data }));
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not run AI analysis.";
      alert(msg);
    } finally {
      setAiLoading((m) => ({ ...m, [subId]: false }));
    }
  };

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      {submissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-24">
                  Attempt
                </th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-40">
                  Status
                </th>
                {isFaculty ? (
                  <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted w-56">
                    AI signal
                  </th>
                ) : null}
                <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted text-right w-24">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {submissions.map((sub, index) => {
                const attemptNum = submissions.length - index;

                // Check if every rubric criterion has a result saved
                const rubricCount =
                  assignmentData?.rubric_criterias?.length || 0;
                const resultsCount = sub?.rubric_results?.length || 0;
                const isGraded = rubricCount > 0 && resultsCount >= rubricCount;

                return (
                  <tr
                    key={sub.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/faculty/${courseId}/grades/${sub.id}`,
                      )
                    }
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-black text-accent text-xs">
                        <Hash size={14} className="text-secondary" />{" "}
                        {attemptNum}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <Calendar
                          size={14}
                          className="text-primary opacity-60"
                        />
                        {new Date(sub.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                          isGraded ? "text-green-600" : "text-amber-500"
                        }`}
                      >
                        {isGraded ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <CircleDashed
                            size={14}
                            className="animate-spin-slow"
                          />
                        )}
                        {isGraded ? "Graded" : "Ungraded"}
                      </div>
                    </td>
                    {isFaculty ? (
                      <td
                        className="px-6 py-4 align-top"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-2 max-w-[220px]">
                          <button
                            type="button"
                            onClick={(e) => runAiCheck(sub.id, e)}
                            disabled={!!aiLoading[sub.id]}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
                          >
                            {aiLoading[sub.id] ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            Check
                          </button>
                          {aiBySubmission[sub.id]?.summary ? (
                            <p
                              className={`text-[10px] font-bold leading-snug ${
                                aiBySubmission[sub.id].prediction === "ai"
                                  ? "text-amber-700"
                                  : aiBySubmission[sub.id].prediction ===
                                      "human"
                                    ? "text-emerald-700"
                                    : "text-text-muted"
                              }`}
                            >
                              {aiBySubmission[sub.id].summary}
                            </p>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                    <td className="px-6 py-4 text-right">
                      <ChevronRight
                        size={18}
                        className="inline text-border group-hover:text-primary transition-transform group-hover:translate-x-1"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
      <InboxIcon size={48} className="text-border mb-4 opacity-20" />
      <h3 className="text-sm font-black text-accent uppercase tracking-widest">
        No Submissions
      </h3>
      <p className="text-[10px] text-text-muted font-bold uppercase mt-1">
        Activity will appear here once students submit work.
      </p>
    </div>
  );
}
