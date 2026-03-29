"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import {
  Plus,
  FileJson,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Shield,
  ArrowLeft,
} from "lucide-react";

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

export default function CreateGroupsPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const assignmentId = params["assignment-id"];
  const courseId = params["course-id"];

  const [mode, setMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [assignmentGrouped, setAssignmentGrouped] = useState(null);

  const [manualGroup, setManualGroup] = useState({
    name: "",
    maxMembers: 4,
    members: [""],
    leaderIndex: 0,
  });
  const [bulkData, setBulkData] = useState("");

  useEffect(() => {
    if (!assignmentId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`assignments/${assignmentId}/`);
        if (!cancelled) setAssignmentGrouped(res.data?.is_grouped ?? false);
      } catch {
        if (!cancelled) setAssignmentGrouped(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, assignmentId]);

  const fetchRosterIndex = useCallback(async () => {
    const res = await api.get(`courses/${courseId}/rosters/`);
    return buildCwidToRosterId(res.data || []);
  }, [api, courseId]);

  const createGroupWithMembers = async (name, maxMembers, memberCwids, leaderCwid) => {
    const cwids = memberCwids.map(normalizeCwid).filter(Boolean);
    if (!cwids.length) {
      throw new Error("Add at least one member CWID.");
    }
    const leader = normalizeCwid(leaderCwid);
    if (!leader || !cwids.some((c) => c.toLowerCase() === leader.toLowerCase())) {
      throw new Error("Leader CWID must match one of the members.");
    }

    const rosterByCwid = await fetchRosterIndex();
    const rosterIds = [];
    for (const c of cwids) {
      const rid = rosterByCwid.get(c.toLowerCase());
      if (!rid) {
        throw new Error(
          `No roster entry for CWID "${c}" in this course. Add the student to the roster first.`,
        );
      }
      rosterIds.push({ cwid: c, id: rid });
    }

    const requested = Number(maxMembers);
    const cap = Math.max(
      cwids.length,
      1,
      Number.isFinite(requested) && requested > 0 ? requested : cwids.length,
    );
    const groupRes = await api.post(`assignments/${assignmentId}/groups/`, {
      assignment: assignmentId,
      name: name.trim(),
      max_members: cap,
    });
    const groupId = groupRes.data?.id;
    if (!groupId) {
      throw new Error("Group was created but no id was returned.");
    }

    const leaderLower = leader.toLowerCase();
    for (const { cwid, id: rosterId } of rosterIds) {
      await api.post(
        `assignments/${assignmentId}/groups/${groupId}/memberships/`,
        {
          group: groupId,
          roster: rosterId,
          is_leader: cwid.toLowerCase() === leaderLower,
        },
      );
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      if (assignmentGrouped === false) {
        setStatus({
          type: "error",
          message:
            "This assignment is not marked as a group assignment (is_grouped). Enable it on the assignment first.",
        });
        return;
      }

      await createGroupWithMembers(
        manualGroup.name,
        manualGroup.maxMembers,
        manualGroup.members,
        manualGroup.members[manualGroup.leaderIndex],
      );

      setStatus({
        type: "success",
        message: "Group and memberships created successfully.",
      });
      setManualGroup({
        name: "",
        maxMembers: 4,
        members: [""],
        leaderIndex: 0,
      });
    } catch (err) {
      const msg =
        err.message ||
        formatApiErrors(err.response?.data) ||
        "Could not create group.";
      setStatus({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const normalizeBulkItem = (item) => {
    if (item.members && Array.isArray(item.members)) {
      return {
        name: item.name,
        max_members: item.max_members,
        cwids: item.members.map((m) => m.cwid),
        leader_cwid: item.members.find((m) => m.is_leader)?.cwid,
      };
    }
    return {
      name: item.name,
      max_members: item.max_members,
      cwids: item.cwids,
      leader_cwid: item.leader_cwid,
    };
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });
    try {
      if (assignmentGrouped === false) {
        setStatus({
          type: "error",
          message:
            "This assignment is not marked as a group assignment (is_grouped). Enable it on the assignment first.",
        });
        return;
      }

      const parsed = JSON.parse(bulkData);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      for (const raw of rows) {
        const item = normalizeBulkItem(raw);
        const cwids = (item.cwids || []).map((c) => normalizeCwid(c)).filter(Boolean);
        const leaderRaw = item.leader_cwid ?? item.leaderCwid;
        const leader = normalizeCwid(leaderRaw);
        if (!item.name || !cwids.length || !leader) {
          throw new Error(
            "Each entry needs name, cwids (or members[]), and leader_cwid / a member with is_leader.",
          );
        }
        const cap =
          item.max_members != null
            ? Number(item.max_members)
            : Math.max(cwids.length, 4);
        await createGroupWithMembers(item.name, cap, cwids, leader);
      }
      setStatus({
        type: "success",
        message: `Created ${rows.length} group(s).`,
      });
      setBulkData("");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setStatus({
          type: "error",
          message: "Invalid JSON. Check brackets and commas.",
        });
      } else {
        const msg =
          err.message ||
          formatApiErrors(err.response?.data) ||
          "Batch create failed.";
        setStatus({ type: "error", message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Logistics
          </button>
          <h1 className="text-4xl font-black text-accent uppercase tracking-tighter">
            Group Deployment
          </h1>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
            Assignment ID: {assignmentId?.slice(0, 8)}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-border/60 shadow-inner">
          <TabBtn
            active={mode === "manual"}
            onClick={() => setMode("manual")}
            label="Manual Entry"
            icon={<Plus size={14} />}
          />
          <TabBtn
            active={mode === "bulk"}
            onClick={() => setMode("bulk")}
            label="JSON Inject"
            icon={<FileJson size={14} />}
          />
        </div>
      </header>

      {assignmentGrouped === false && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This assignment has <strong>is_grouped</strong> turned off. The API
          will reject new groups until you enable group work on the assignment.
        </div>
      )}

      <div className="bg-surface rounded-[2.5rem] border border-border shadow-2xl overflow-hidden relative">
        <div className="h-2 bg-primary w-full" />
        <div className="p-8 md:p-12">
          {mode === "manual" ? (
            <form onSubmit={handleManualSubmit} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
                  Group Designation
                </label>
                <input
                  required
                  maxLength={50}
                  value={manualGroup.name}
                  onChange={(e) =>
                    setManualGroup({ ...manualGroup, name: e.target.value })
                  }
                  className="w-full p-5 bg-background border border-border rounded-2xl text-base font-bold text-accent shadow-inner outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="e.g. ALPHA_SQUAD"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
                  Max members (capacity)
                </label>
                <input
                  type="number"
                  min={1}
                  max={32767}
                  value={manualGroup.maxMembers}
                  onChange={(e) =>
                    setManualGroup({
                      ...manualGroup,
                      maxMembers: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full max-w-xs p-4 bg-white border border-border rounded-xl text-sm font-bold shadow-sm outline-none focus:border-primary"
                />
                <p className="text-[10px] text-text-muted uppercase tracking-tight">
                  Must be at least the number of students you add. The server
                  may increase the effective cap to fit your roster lines.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
                  Roster CWIDs & leader
                </label>
                <div className="grid gap-3">
                  {manualGroup.members.map((m, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center animate-in slide-in-from-left-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setManualGroup({ ...manualGroup, leaderIndex: i })
                        }
                        className={`px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-2 ${
                          manualGroup.leaderIndex === i
                            ? "bg-secondary border-secondary text-accent shadow-lg"
                            : "bg-white border-slate-100 text-slate-300 hover:border-secondary/40"
                        }`}
                      >
                        <Shield
                          size={18}
                          className={
                            manualGroup.leaderIndex === i ? "animate-pulse" : ""
                          }
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {manualGroup.leaderIndex === i ? "Leader" : "Set"}
                        </span>
                      </button>

                      <input
                        required
                        placeholder="Student CWID (course roster)"
                        value={m}
                        onChange={(e) => {
                          const newM = [...manualGroup.members];
                          newM[i] = e.target.value;
                          setManualGroup({ ...manualGroup, members: newM });
                        }}
                        className="flex-1 p-4 bg-white border border-border rounded-xl text-sm font-mono font-bold shadow-sm outline-none focus:border-primary"
                      />

                      {manualGroup.members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newM = manualGroup.members.filter(
                              (_, idx) => idx !== i,
                            );
                            let nextLeader = manualGroup.leaderIndex;
                            if (manualGroup.leaderIndex === i) nextLeader = 0;
                            else if (manualGroup.leaderIndex > i)
                              nextLeader = manualGroup.leaderIndex - 1;
                            setManualGroup({
                              ...manualGroup,
                              members: newM,
                              leaderIndex: nextLeader,
                            });
                          }}
                          className="p-4 text-error hover:bg-error/5 rounded-xl transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setManualGroup({
                      ...manualGroup,
                      members: [...manualGroup.members, ""],
                    })
                  }
                  className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:border-primary hover:text-primary transition-all"
                >
                  + Add member row
                </button>
              </div>

              <button
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-secondary hover:text-accent transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Create group
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4">
                <Info size={24} className="text-primary shrink-0" />
                <div className="space-y-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                  <p className="text-primary font-black tracking-widest">
                    JSON format (array)
                  </p>
                  <p>
                    Each object:{" "}
                    <code className="text-primary font-mono">
                      name, max_members?, cwids[], leader_cwid
                    </code>{" "}
                    or{" "}
                    <code className="text-primary font-mono">
                      members: [&#123; cwid, is_leader &#125;]
                    </code>
                    . CWIDs must exist on the course roster.
                  </p>
                </div>
              </div>
              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                className="w-full h-96 p-8 bg-slate-900 text-secondary font-mono text-xs rounded-3xl border border-border shadow-2xl focus:ring-8 focus:ring-primary/5 outline-none"
                placeholder={`[
  {
    "name": "Team A",
    "max_members": 4,
    "cwids": ["12345678", "87654321"],
    "leader_cwid": "12345678"
  }
]`}
              />
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-secondary hover:text-accent transition-all active:scale-95 flex justify-center items-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <FileJson size={18} />
                )}{" "}
                Create groups from JSON
              </button>
            </div>
          )}

          {status.message && (
            <div
              className={`mt-10 p-5 rounded-2xl border flex items-center gap-4 animate-in zoom-in ${status.type === "error" ? "bg-red-50 border-red-100 text-error" : "bg-green-50 border-green-100 text-green-700"}`}
            >
              {status.type === "error" ? (
                <AlertCircle size={22} />
              ) : (
                <CheckCircle2 size={22} />
              )}
              <p className="text-[11px] font-black uppercase tracking-widest leading-tight whitespace-pre-wrap">
                {status.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${active ? "bg-white shadow-lg text-primary scale-105" : "text-slate-400 hover:text-slate-600"}`}
    >
      {icon} {label}
    </button>
  );
}
