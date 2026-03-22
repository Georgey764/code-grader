"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Users, ChevronDown, User, Shield } from "lucide-react";

function normalizeCwid(c) {
  if (c == null || c === "") return "";
  return String(c).trim().toLowerCase();
}

function isUserInGroup(group, cwidNorm) {
  if (!cwidNorm) return false;
  return (group.group_memberships || []).some((m) => {
    const u = m.roster_student?.student_profile?.user;
    return u?.cwid && normalizeCwid(u.cwid) === cwidNorm;
  });
}

function isMembershipCurrentUser(m, cwidNorm) {
  if (!cwidNorm) return false;
  const u = m.roster_student?.student_profile?.user;
  return u?.cwid && normalizeCwid(u.cwid) === cwidNorm;
}

export default function StudentViewGroupsPage() {
  const { api, user } = useMetadata();
  const { "course-id": courseId, "assignment-id": assignmentId } = useParams();

  const myCwidNorm = useMemo(() => normalizeCwid(user?.cwid), [user?.cwid]);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadError(null);
      try {
        const res = await api.get(`assignments/${assignmentId}/groups/`);
        const raw = Array.isArray(res.data)
          ? res.data
          : (res.data?.results ?? []);

        const cwidNorm = normalizeCwid(user?.cwid);
        const sorted = [...raw].sort((a, b) => {
          const aMine = isUserInGroup(a, cwidNorm);
          const bMine = isUserInGroup(b, cwidNorm);
          if (aMine && !bMine) return -1;
          if (!aMine && bMine) return 1;
          return 0;
        });

        setGroups(sorted);
        const mine = sorted.find((g) => isUserInGroup(g, cwidNorm));
        setExpanded(mine?.id ?? null);
      } catch (err) {
        console.error(err?.response);
        setLoadError(
          err.response?.data?.detail ||
            "Could not load groups for this assignment.",
        );
        setGroups([]);
        setExpanded(null);
      } finally {
        setLoading(false);
      }
    };
    if (assignmentId) fetchGroups();
  }, [api, assignmentId, courseId, user?.cwid]);

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-h2 font-black text-accent uppercase tracking-tight">
          Groups
        </h1>
        <p className="text-sm text-text-muted">
          View groups for this assignment. Your instructor manages membership.
          {myCwidNorm && (
            <span className="block mt-1 text-primary font-medium">
              Your group is listed first and highlighted.
            </span>
          )}
        </p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
          {typeof loadError === "string" ? loadError : "Could not load groups."}
        </div>
      )}

      <div className="space-y-3">
        {groups.length === 0 && !loadError ? (
          <p className="text-sm text-text-muted py-8 text-center">
            No groups have been set up for this assignment yet.
          </p>
        ) : (
          groups.map((group) => {
            const isMine = isUserInGroup(group, myCwidNorm);
            return (
              <div
                key={group.id}
                className={`rounded-2xl overflow-hidden shadow-sm transition-shadow ${
                  isMine
                    ? "ring-2 ring-primary/50 border-2 border-primary "
                    : "bg-surface border border-border hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(expanded === group.id ? null : group.id)
                  }
                  className={`w-full flex items-center justify-between p-6 transition-colors text-left ${
                    isMine
                      ? " hover:bg-primary/[0.14]"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        isMine
                          ? "bg-primary/20 text-primary"
                          : "bg-slate-100 text-primary"
                      }`}
                    >
                      <Users size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <h2 className="text-sm font-black uppercase text-accent leading-none">
                          {group.name}
                        </h2>
                        {isMine && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded-md">
                            Your group
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">
                        {group.current_count ??
                          group.group_memberships?.length ??
                          0}{" "}
                        / {group.max_members ?? "—"} members
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`shrink-0 transition-transform duration-500 ${expanded === group.id ? "rotate-180 text-primary" : "text-slate-300"}`}
                  />
                </button>

                {expanded === group.id && (
                  <div
                    className={`p-6 border-t animate-in slide-in-from-top-2 ${
                      isMine
                        ? "bg-primary/[0.06] border-primary/20"
                        : "bg-slate-50/50 border-border"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(group.group_memberships || []).map((m) => {
                        const u = m.roster_student?.student_profile?.user;
                        const name = u
                          ? `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                            u.email
                          : "";
                        const isYou = isMembershipCurrentUser(m, myCwidNorm);
                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-xl border flex items-center justify-between ${
                              isYou
                                ? "border-primary ring-1 ring-primary/30"
                                : "bg-white border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <User
                                size={16}
                                className={
                                  isYou
                                    ? "text-primary shrink-0"
                                    : "text-slate-400 shrink-0"
                                }
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-accent uppercase truncate">
                                  {name || "Student"}
                                  {isYou && (
                                    <span className="text-primary normal-case font-bold">
                                      {" "}
                                      (you)
                                    </span>
                                  )}
                                </p>
                                <p className="text-[9px] font-bold text-text-muted uppercase font-mono">
                                  {u?.cwid ?? m.roster}
                                </p>
                              </div>
                            </div>
                            {m.is_leader && (
                              <span className="flex items-center gap-1 text-[9px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded uppercase shrink-0">
                                <Shield size={10} /> Leader
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
