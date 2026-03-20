"use client";

import { useMetadata } from "@/context";
import {
  FileCode,
  Users,
  ChevronRight,
  Clock,
  Trophy,
  Terminal,
  CalendarDays,
  AlertCircle,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

function getRole(role) {
  if (role.toLowerCase() == "st") {
    return "student";
  } else {
    return "faculty";
  }
}

export default function AssignmentList({ asgn }) {
  const router = useRouter();
  const params = useParams();
  const courseId = params["course-id"];
  const { user, api } = useMetadata();
  const isFaculty = user?.role === "FA";
  const [showModal, setShowModal] = useState(false);

  // Calculate urgency
  const dueDate = new Date(asgn.deadline);
  const isPastDue = dueDate < new Date();

  // Dynamic Language Tag based on schema
  const languageLabel = asgn.language === "python" ? "Python 3" : "Java 17";

  const handleDelete = async () => {
    try {
      await api.delete(`assignments/${asgn.id}/`);
      window.location.reload();
      setShowModal(false);
    } catch (error) {
      console.error("Failed to delete assignment", error);
    }
  };
  return (
    <div className="group bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 hover:shadow-md transition-all animate-in fade-in">
      {/* Modal for delete confirmation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/40 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-error/10 text-error rounded-lg">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-text-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-accent uppercase tracking-tight">
                  Remove Assignment?
                </h3>
                <p className="text-sm text-text-muted">
                  Remove the assignment{" "}
                  <span className="font-bold">{asgn.name}</span> from the
                  course?
                </p>
              </div>
            </div>

            <div className="p-4 bg-background flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-xs font-bold uppercase text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowModal(false);
                }}
                className="flex-1 py-2 bg-error text-white text-xs font-black uppercase rounded"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-5 flex-1 min-w-0">
        {/* 1. Status Icon - Uses Maroon primary for active work */}
        <div
          className={`shrink-0 p-3 rounded-xl transition-colors ${
            isPastDue
              ? "bg-slate-100 text-slate-400"
              : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
          }`}
        >
          <FileCode size={22} />
        </div>

        {/* 2. Core Assignment Data */}
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-black text-accent uppercase tracking-tight group-hover:text-primary transition-colors truncate">
              {asgn.name}
            </h3>
            {/* Language Badge */}
            <span className="px-2 py-0.5 bg-slate-100 text-text-muted text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
              <Terminal size={10} /> {languageLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isPastDue ? "text-error" : "text-text-muted"}`}
            >
              {isPastDue ? (
                <AlertCircle size={12} />
              ) : (
                <CalendarDays size={12} className="text-secondary" />
              )}
              Due {dueDate.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Indicators & Action */}
      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
        <div className="flex items-center gap-3">
          {asgn.is_grouped && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary rounded text-[9px] font-black uppercase tracking-[0.15em]">
              <Users size={12} /> Group
            </div>
          )}
          {asgn.is_file_input && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-border text-text-muted rounded text-[9px] font-black uppercase tracking-[0.15em]">
              File Input
            </div>
          )}
        </div>

        {isFaculty && (
          <button
            onClick={(e) => {
              setShowModal(true);
            }}
            className="cursor-pointer p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}

        <div
          onClick={() =>
            router.push(
              `/dashboard/${getRole(user.role)}/${courseId}/assignments/${asgn.id}`,
            )
          }
          className="cursor-pointer p-2 text-border group-hover:text-primary group-hover:translate-x-1 transition-all"
        >
          <ChevronRight size={20} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}
