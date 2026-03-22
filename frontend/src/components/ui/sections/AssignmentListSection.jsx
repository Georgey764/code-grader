"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LoadingPage } from "@/components/ui/sections";
import { useMetadata } from "@/context";
import { CalendarClock, History } from "lucide-react";
import { useParams } from "next/navigation";
import { AssignmentList, NoItemFound } from "@/components/ui/elements";

function partitionByDeadline(assignments) {
  const now = Date.now();
  const upcoming = [];
  const pastDue = [];
  const undated = [];

  for (const asgn of assignments || []) {
    const t = asgn?.deadline ? new Date(asgn.deadline).getTime() : NaN;
    if (!Number.isFinite(t)) {
      undated.push(asgn);
      continue;
    }
    if (t >= now) upcoming.push(asgn);
    else pastDue.push(asgn);
  }

  upcoming.sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline),
  );
  pastDue.sort(
    (a, b) => new Date(b.deadline) - new Date(a.deadline),
  );

  return { upcoming, pastDue, undated };
}

const Page = () => {
  const { "course-id": courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api } = useMetadata();

  useEffect(() => {
    if (!courseId || assignments.length > 0) return;
    const fetchPageData = async () => {
      try {
        const response = await api.get(`assignments/?course_id=${courseId}`);
        setAssignments(response?.data);
      } catch (err) {
        alert(`Error fetching assignments`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [api, courseId, assignments.length]);

  const { upcoming, pastDue, undated } = useMemo(
    () => partitionByDeadline(assignments),
    [assignments],
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  const renderList = (list) =>
    list.map((asgn) => <AssignmentList key={asgn.id} asgn={asgn} />);

  const upcomingTotal = upcoming.length + undated.length;
  const showUpcomingBlock = upcomingTotal > 0 || pastDue.length === 0;

  return (
    <main className="flex-1 transition-all duration-300 p-4">
      <div className="max-w-5xl space-y-10">
        {assignments.length === 0 ? (
          <NoItemFound name="assignment" />
        ) : (
          <>
            {showUpcomingBlock && (
              <section
                className="space-y-4"
                aria-labelledby="assignments-upcoming-heading"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarClock size={18} strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="assignments-upcoming-heading"
                      className="text-xs font-black uppercase tracking-[0.2em] text-accent"
                    >
                      Upcoming &amp; open
                    </h2>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Due soonest first; items without a due date stay open.
                    </p>
                  </div>
                  {upcomingTotal > 0 && (
                    <span className="ml-auto tabular-nums rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                      {upcomingTotal}
                    </span>
                  )}
                </div>
                {upcomingTotal > 0 && (
                  <div className="space-y-4">
                    {upcoming.length > 0 && renderList(upcoming)}
                    {undated.length > 0 && (
                      <>
                        {upcoming.length > 0 && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1 pt-2">
                            No due date
                          </p>
                        )}
                        {renderList(undated)}
                      </>
                    )}
                  </div>
                )}
              </section>
            )}

            {pastDue.length > 0 && (
              <>
                <div
                  className="flex items-center gap-4"
                  role="separator"
                  aria-label="Past due assignments"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
                    Past due
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
                </div>

                <section
                  className="space-y-4"
                  aria-labelledby="assignments-past-heading"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <History size={18} strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <h2
                        id="assignments-past-heading"
                        className="text-xs font-black uppercase tracking-[0.2em] text-accent"
                      >
                        Past deadline
                      </h2>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Most recently due first.
                      </p>
                    </div>
                    <span className="ml-auto tabular-nums rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {pastDue.length}
                    </span>
                  </div>
                  <div className="space-y-4">{renderList(pastDue)}</div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Page;
