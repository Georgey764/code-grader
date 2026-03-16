"use client";

import React from "react";
import {
  Clock,
  Trophy,
  Terminal,
  Download,
  Users,
  User,
  FileCode,
} from "lucide-react";

export default function AssignmentDetails({ assignmentData }) {
  if (!assignmentData) return null;

  const dueDate = new Date(assignmentData.deadline);
  const isPastDue = dueDate < new Date();

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      {/* 1. Header: Small & Tight */}
      <div className="border-b border-border pb-3 mb-6">
        <h1 className="text-2xl font-black text-accent uppercase tracking-tight">
          {assignmentData.name}
        </h1>

        {/* Inline Meta Strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
          <MetaInfo
            icon={<Clock size={12} />}
            text={dueDate.toLocaleString([], {
              dateStyle: "short",
              timeStyle: "short",
            })}
            urgent={isPastDue}
          />
          <MetaInfo
            icon={<Trophy size={12} />}
            text={`${assignmentData.max_points_allowed} pts`}
          />
          <MetaInfo
            icon={
              assignmentData.is_grouped ? (
                <Users size={12} />
              ) : (
                <User size={12} />
              )
            }
            text={assignmentData.is_grouped ? "Group" : "Individual"}
          />
          <MetaInfo
            icon={<Terminal size={12} />}
            text={assignmentData.language === "python" ? "Python" : "Java"}
          />
        </div>
      </div>

      {/* 2. Body: Clean Text */}
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-text-main font-medium whitespace-pre-wrap opacity-90">
          {assignmentData.description || "No additional instructions provided."}
        </p>

        {/* 3. Action: Minimalist Link */}
        {assignmentData.starter_code && (
          <div className="pt-2">
            <a
              href={assignmentData.starter_code}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-accent transition-all shadow-sm"
            >
              <Download size={14} />
              Download Starter Code
            </a>
          </div>
        )}
      </div>

      {/* ID Footer */}
      <div className="mt-12 pt-4 border-t border-border/50">
        <p className="text-[9px] font-mono text-text-muted uppercase tracking-tighter opacity-50">
          Ref ID: {assignmentData.id}
        </p>
      </div>
    </div>
  );
}

/** * Minimalist Meta Helper */
function MetaInfo({ icon, text, urgent = false }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${urgent ? "text-error" : "text-text-muted"}`}
    >
      <span className={urgent ? "text-error" : "text-secondary"}>{icon}</span>
      {text}
    </span>
  );
}
