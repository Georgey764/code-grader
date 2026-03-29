"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Save,
  ArrowLeft,
  UserMinus,
  Shield,
  ShieldOff,
  Loader2,
  Plus,
} from "lucide-react";

function memberUser(m) {
  return m?.roster_student?.student_profile?.user;
}

function displayName(user) {
  if (!user) return "Unknown student";
  const n = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return n || user.email || "Student";
}

function initialFromUser(user) {
  const n = displayName(user);
  return n ? n.charAt(0).toUpperCase() : "?";
}

function formatApiErrors(data) {
  if (!data || typeof data !== "object") return "Request failed.";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.map(String).join(" ");
  if (data.error) return String(data.error);
  const parts = [];
  for (const [k, v] of Object.entries(data)) {
    if (v == null) continue;
    if (typeof v === "string") parts.push(`${k}: ${v}`);
    else if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
    else if (typeof v === "object")
      parts.push(`${k}: ${JSON.stringify(v)}`);
  }
  return parts.join("; ") || "Request failed.";
}

function normalizeCwid(s) {
  return String(s ?? "").trim();
}

function buildCwidToRosterId(rosters) {
  const map = new Map();
  for (const row of rosters) {
    const cwid = row?.student_profile?.user?.cwid;
    if (cwid != null && cwid !== "")
      map.set(String(cwid).trim().toLowerCase(), row.id);
  }
  return map;
}

export default function EditGroupPage() {
  const { api, user } = useMetadata();
  const { "assignment-id": assignmentId, "course-id": courseId } =
    useParams();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("group_id");
  const router = useRouter();

  const isFaculty = user?.role === "FA";

  const [group, setGroup] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [newMemberCwid, setNewMemberCwid] = useState("");
  const [newMemberAsLeader, setNewMemberAsLeader] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const membershipBase = useCallback(
    (gid, mid) =>
      `assignments/${assignmentId}/groups/${gid}/memberships/${mid}/`,
    [assignmentId],
  );

  const loadGroup = useCallback(async () => {
    if (!assignmentId || !groupId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get(
        `assignments/${assignmentId}/groups/${groupId}/`,
      );
      setGroup(res.data);
    } catch (err) {
      setLoadError(
        formatApiErrors(err.response?.data) || "Could not load group.",
      );
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [api, assignmentId, groupId]);

  const refreshGroup = useCallback(async () => {
    if (!assignmentId || !groupId) return;
    try {
      const res = await api.get(
        `assignments/${assignmentId}/groups/${groupId}/`,
      );
      setGroup(res.data);
    } catch {
      /* keep existing state */
    }
  }, [api, assignmentId, groupId]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const rosterIdsInGroup = useCallback((g) => {
    const set = new Set();
    for (const m of g?.group_memberships || []) {
      if (m.roster != null) set.add(String(m.roster));
    }
    return set;
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isFaculty || !group?.id || !courseId) return;
    const cwid = normalizeCwid(newMemberCwid);
    if (!cwid) {
      setStatus({ type: "error", message: "Enter a student CWID." });
      return;
    }

    const current = group.group_memberships || [];
    if (current.length >= group.max_members) {
      setStatus({
        type: "error",
        message:
          "Group is at capacity. Increase “Max members” and save before adding more students.",
      });
      return;
    }

    setAddingMember(true);
    setStatus({ type: null, message: "" });
    try {
      const res = await api.get(`courses/${courseId}/rosters/`);
      const rosterByCwid = buildCwidToRosterId(res.data || []);
      const rosterId = rosterByCwid.get(cwid.toLowerCase());
      if (!rosterId) {
        setStatus({
          type: "error",
          message: `No roster entry for CWID “${cwid}” in this course.`,
        });
        return;
      }
      if (rosterIdsInGroup(group).has(String(rosterId))) {
        setStatus({
          type: "error",
          message: "That student is already in this group.",
        });
        return;
      }

      await api.post(
        `assignments/${assignmentId}/groups/${group.id}/memberships/`,
        {
          group: group.id,
          roster: rosterId,
          is_leader: newMemberAsLeader,
        },
      );
      setNewMemberCwid("");
      setNewMemberAsLeader(false);
      setStatus({ type: "success", message: "Member added." });
      await refreshGroup();
    } catch (err) {
      setStatus({
        type: "error",
        message:
          formatApiErrors(err.response?.data) || "Failed to add member.",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateMember = async (membershipId, patchData) => {
    if (!isFaculty || !group?.id) return;
    setStatus({ type: null, message: "" });
    try {
      await api.patch(
        membershipBase(group.id, membershipId),
        patchData,
      );
      await refreshGroup();
    } catch (err) {
      setStatus({
        type: "error",
        message:
          formatApiErrors(err.response?.data) || "Failed to update member.",
      });
    }
  };

  const handleRemoveMember = async (membershipId) => {
    if (!isFaculty || !group?.id) return;
    if (
      !window.confirm(
        "Remove this student from the group?",
      )
    ) {
      return;
    }
    setStatus({ type: null, message: "" });
    try {
      await api.delete(membershipBase(group.id, membershipId));
      setGroup((g) => {
        if (!g?.group_memberships) return g;
        return {
          ...g,
          group_memberships: g.group_memberships.filter(
            (m) => m.id !== membershipId,
          ),
        };
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          formatApiErrors(err.response?.data) || "Failed to remove member.",
      });
    }
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!isFaculty || !group?.id || !assignmentId) return;
    setSaving(true);
    setStatus({ type: null, message: "" });
    try {
      const payload = {
        name: group.name.trim(),
        max_members: group.max_members,
      };
      const { data } = await api.patch(
        `assignments/${assignmentId}/groups/${group.id}/`,
        payload,
      );
      setGroup((g) => ({ ...g, ...data }));
      setStatus({ type: "success", message: "Group name and capacity saved." });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          formatApiErrors(err.response?.data) || "Failed to save group.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!groupId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-sm text-error">
          Missing <code className="font-mono">group_id</code> query parameter.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary"
        >
          Go back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-20 text-center font-black flex items-center justify-center gap-3">
        <Loader2 className="animate-spin" size={22} />
        Loading group…
      </div>
    );
  }

  if (loadError || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <p className="text-error text-sm">{loadError || "Group not found."}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );
  }

  const memberships = group.group_memberships || [];
  const atCapacity = memberships.length >= group.max_members;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10 animate-in fade-in duration-700">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {!isFaculty && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Only the course instructor can change the group name, capacity, or
          membership. You can still view members below.
        </div>
      )}

      <form onSubmit={isFaculty ? handleSaveGroup : (e) => e.preventDefault()}>
        <div className="bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Group name
              </label>
              {isFaculty ? (
                <input
                  required
                  maxLength={50}
                  value={group.name}
                  onChange={(e) => setGroup({ ...group, name: e.target.value })}
                  className="text-4xl font-black text-accent uppercase tracking-tighter bg-transparent border-b border-border w-full pb-2 focus:border-primary outline-none"
                />
              ) : (
                <p className="text-3xl font-black text-accent uppercase tracking-tighter">
                  {group.name}
                </p>
              )}
            </div>

            <div className="space-y-3 max-w-xs">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Max members
              </label>
              {isFaculty ? (
                <input
                  type="number"
                  min={Math.max(1, memberships.length)}
                  max={32767}
                  value={group.max_members}
                  onChange={(e) =>
                    setGroup({
                      ...group,
                      max_members: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full p-4 bg-white border border-border rounded-xl text-sm font-bold shadow-sm outline-none focus:border-primary"
                />
              ) : (
                <p className="text-sm font-bold text-accent">{group.max_members}</p>
              )}
              {isFaculty && (
                <p className="text-[10px] text-text-muted uppercase tracking-tight">
                  Cannot be lower than the current number of members (
                  {memberships.length}).
                </p>
              )}
            </div>

            {isFaculty && (
              <div className="space-y-4 rounded-2xl border border-border bg-slate-50/80 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Add member
                </h3>
                <p className="text-[10px] text-text-muted uppercase tracking-tight">
                  CWID must exist on this course roster. Save a higher max if the
                  group is full.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Student CWID
                    </label>
                    <input
                      value={newMemberCwid}
                      onChange={(e) => setNewMemberCwid(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMember(e);
                        }
                      }}
                      placeholder="e.g. 12345678"
                      disabled={atCapacity || addingMember}
                      className="w-full p-4 bg-white border border-border rounded-xl text-sm font-mono font-bold shadow-sm outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={newMemberAsLeader}
                      onChange={(e) => setNewMemberAsLeader(e.target.checked)}
                      disabled={atCapacity || addingMember}
                      className="rounded border-border"
                    />
                    Group leader
                  </label>
                  <button
                    type="button"
                    disabled={atCapacity || addingMember}
                    onClick={handleAddMember}
                    className="flex items-center justify-center gap-2 py-4 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-accent transition-colors disabled:opacity-50 shrink-0"
                  >
                    {addingMember ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    Add
                  </button>
                </div>
                {atCapacity && (
                  <p className="text-xs text-amber-800">
                    At capacity ({memberships.length}/{group.max_members}). Raise
                    max members and click “Save group” first.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="border-b border-border pb-2 space-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Members ({memberships.length}/{group.max_members})
                </h3>
                {isFaculty && (
                  <p className="text-[10px] text-text-muted normal-case font-medium tracking-normal">
                    Only one leader per group. Marking someone as leader removes
                    leader status from everyone else.
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                {memberships.map((m) => {
                  const userM = memberUser(m);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-5 bg-slate-50 border border-border rounded-2xl"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-white border border-border flex items-center justify-center font-black text-primary text-xs">
                          {initialFromUser(userM)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-accent uppercase tracking-tight truncate">
                            {displayName(userM)}
                          </p>
                          <p className="text-[10px] font-bold text-text-muted uppercase font-mono">
                            {userM?.cwid ?? m.roster}
                          </p>
                        </div>
                      </div>

                      {isFaculty && (
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateMember(m.id, {
                                is_leader: !m.is_leader,
                              })
                            }
                            className={`p-2 rounded-lg transition-all ${m.is_leader ? "bg-secondary text-accent" : "bg-white text-slate-300 hover:text-secondary"}`}
                            title="Toggle leader"
                          >
                            {m.is_leader ? (
                              <Shield size={18} />
                            ) : (
                              <ShieldOff size={18} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-2 bg-white text-slate-300 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from group"
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {memberships.length === 0 && (
                <p className="text-sm text-text-muted">
                  No members in this group yet.
                </p>
              )}
            </div>

            {status.message && (
              <div
                className={`p-4 rounded-2xl border text-sm ${status.type === "error" ? "bg-red-50 border-red-100 text-error" : "bg-green-50 border-green-100 text-green-800"}`}
              >
                {status.message}
              </div>
            )}

            {isFaculty && (
              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-accent text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Save group
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
