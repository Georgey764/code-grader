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
} from "lucide-react";
import { CodeReport } from "@/components/ui/sections";

export default function SubmissionsPage() {
  const param = useParams();
  const assignmentId = param["assignment-id"];
  const { api } = useMetadata();

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
