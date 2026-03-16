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
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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
  const { user } = useMetadata();

  // Calculate urgency
  const dueDate = new Date(asgn.deadline);
  const isPastDue = dueDate < new Date();

  // Dynamic Language Tag based on schema
  const languageLabel = asgn.language === "python" ? "Python 3" : "Java 17";

  return (
    <div
      onClick={() =>
        router.push(
          `/app/${getRole(user.role)}/${courseId}/assignments/${asgn.id}`,
        )
      }
      className="group cursor-pointer bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 hover:shadow-md transition-all animate-in fade-in"
    >
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

        <div className="p-2 text-border group-hover:text-primary group-hover:translate-x-1 transition-all">
          <ChevronRight size={20} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}
