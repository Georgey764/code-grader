"use client";

import React from "react";
import {
  Calendar,
  Trophy,
  Users,
  User,
  Download,
  Clock,
  FileCode,
  Hash,
} from "lucide-react";

export default function AssignmentDetails({ assignmentData }) {
  if (!assignmentData) return null;

  const formattedDeadline = new Date(assignmentData.deadline).toLocaleString(
    [],
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  return (
    <header className="relative bg-surface p-5 sm:p-6 md:p-10 rounded-xl border border-border shadow-subtle overflow-hidden">
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-10">
        <div className="space-y-5 w-full">
          {/* Badge Row: Wraps neatly on very small screens */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                assignmentData.is_grouped
                  ? "bg-secondary/10 border-secondary/20 text-secondary"
                  : "bg-accent/5 border-accent/10 text-accent"
              }`}
            >
              {assignmentData.is_grouped ? (
                <>
                  <Users size={12} className="mr-1.5" /> Group Project
                </>
              ) : (
                <>
                  <User size={12} className="mr-1.5" /> Individual Task
                </>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-text-muted uppercase tracking-tighter bg-background px-2 py-1 rounded border border-border">
              <Hash size={10} className="text-secondary" />{" "}
              {assignmentData.id?.slice(0, 8)}
            </span>
          </div>

          {/* Title scaling: Smaller on mobile, massive on large screens */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-accent tracking-tight">
            {assignmentData.name}
          </h1>

          {/* Description: Controlled readability */}
          <p className="text-sm sm:text-base leading-relaxed text-text-main opacity-90 max-w-3xl">
            {assignmentData.description ||
              "No assignment description provided."}
          </p>
        </div>

        {/* Action Button: Full-width on mobile/tablet, auto on desktop */}
        {assignmentData.starter_code && (
          <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <a
              href={assignmentData.starter_code}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-6 py-4 lg:py-3 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded shadow-md hover:bg-accent transition-all active:scale-95 w-full lg:min-w-[220px]"
            >
              <FileCode
                size={18}
                className="text-secondary group-hover:scale-110 transition-transform"
              />
              <span>Starter Code</span>
              <Download size={14} className="opacity-50 ml-auto lg:ml-0" />
            </a>
          </div>
        )}
      </div>

      {/* Metadata Grid: 1 col (mobile) -> 2 col (tablet) -> 3 col (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mt-8 pt-8 border-t border-border/50">
        <MetaItem
          icon={<Clock className="text-primary" />}
          label="Submission Deadline"
          value={formattedDeadline}
        />
        <MetaItem
          icon={<Trophy className="text-secondary" />}
          label="Weight / Points"
          value={`${assignmentData.max_points_allowed} pts`}
        />
        <MetaItem
          icon={<Calendar className="text-accent" />}
          label="Academic Term"
          value="Spring 2026"
        />
      </div>
    </header>
  );
}

/**
 * Reusable helper for metadata blocks with mobile-optimized spacing
 */
function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 sm:gap-3">
      <div className="shrink-0 p-2.5 bg-background rounded-lg border border-border/40 shadow-sm">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-text-muted mb-1 leading-none">
          {label}
        </p>
        <p className="text-sm sm:text-base font-bold text-accent truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
