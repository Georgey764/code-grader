"use client";

import { FileText, Users, ChevronRight, Clock, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignmentList({ asgn }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`assignments/${asgn.id}`)}
      key={asgn.id}
      className="cursor-pointer bg-surface border border-border rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between shadow-subtle hover:border-secondary transition-all group"
    >
      {/* Left Side: Assignment Info */}
      <div className="flex items-start gap-4 flex-1">
        <div className="p-3 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
            {asgn.name}
          </h3>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-text-muted">
            <span className="flex items-center gap-1 font-medium">
              <Clock size={14} className="text-secondary" />
              Due: {new Date(asgn.deadline).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Trophy size={14} className="text-secondary" />
              {asgn.max_points_allowed} Pts
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Dynamic Buttons */}
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        {asgn.is_grouped && (
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-slate-100 text-accent rounded hover:bg-secondary hover:text-white transition-all">
            <Users size={16} /> Show Group Members
          </button>
        )}

        <button className="p-2 text-text-muted hover:text-primary transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
