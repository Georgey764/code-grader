"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Users,
  ChevronDown,
  User,
  Shield,
  Trash2,
  Edit3,
  Loader2,
} from "lucide-react";

export default function ViewGroupsPage() {
  const { api, user } = useMetadata();
  const { "course-id": courseId, "assignment-id": assignmentId } = useParams();
  const router = useRouter();

  const isFaculty = user?.role === "FA";

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get(`assignments/${assignmentId}/groups/`);
        setGroups(res.data);
      } catch (err) {
        console.error(err?.response);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [api, assignmentId, courseId]);

  const handleDeleteGroup = async (group) => {
    if (!isFaculty) return;
    setDeleteError(null);
    if (
      !window.confirm(
        `Delete group "${group.name}"? This removes the group and its memberships.`,
      )
    ) {
      return;
    }
    setDeletingId(group.id);
    try {
      await api.delete(`assignments/${assignmentId}/groups/${group.id}/`);
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      setExpanded((prev) => (prev === group.id ? null : prev));
    } catch (err) {
      const d = err.response?.data;
      const msg =
        (typeof d?.detail === "string" && d.detail) ||
        (Array.isArray(d?.detail) && d.detail.join(" ")) ||
        "Failed to delete group.";
      setDeleteError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center font-black animate-pulse">
        SYNCING DATA...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-700">
      {deleteError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
          {deleteError}
        </div>
      )}
      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() =>
                setExpanded(expanded === group.id ? null : group.id)
              }
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-primary">
                  <Users size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black uppercase text-accent leading-none">
                    {group.name}
                  </h3>
                  <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">
                    {group.current_count ?? group.group_memberships?.length ?? 0}{" "}
                    / {group.max_members ?? "—"} members
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`transition-transform duration-500 ${expanded === group.id ? "rotate-180 text-primary" : "text-slate-300"}`}
              />
            </button>

            {expanded === group.id && (
              <div className="p-6 bg-slate-50/50 border-t border-border animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(group.group_memberships || []).map((m) => {
                    const u = m.roster_student?.student_profile?.user;
                    const name = u
                      ? `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                        u.email
                      : "";
                    return (
                    <div
                      key={m.id}
                      className="bg-white p-4 rounded-xl border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-black text-accent uppercase">
                            {name || "Student"}
                          </p>
                          <p className="text-[9px] font-bold text-text-muted uppercase font-mono">
                            {u?.cwid ?? m.roster}
                          </p>
                        </div>
                      </div>
                      {m.is_leader && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded uppercase">
                          <Shield size={10} /> Leader
                        </span>
                      )}
                    </div>
                  );
                  })}
                </div>

                {isFaculty && (
                  <div className="mt-6 flex flex-wrap gap-2 justify-end pt-4 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/faculty/${courseId}/assignments/${assignmentId}/groups/edit?group_id=${group.id}`,
                        )
                      }
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
                    >
                      <Edit3 size={14} /> Edit group
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === group.id}
                      onClick={() => handleDeleteGroup(group)}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-error hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      {deletingId === group.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}{" "}
                      Delete group
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
