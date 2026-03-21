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
  AlignLeft,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/elements";

export default function AssignmentDetails({ assignmentData }) {
  if (!assignmentData) return null;

  const dueDate = new Date(assignmentData.deadline);
  const isPastDue = dueDate < new Date();

  return (
    <div className="animate-in fade-in duration-500 w-full">
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
            text={`${assignmentData.is_weighted ? "Weighted" : "Unweighted"}`}
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
      <div className="space-y-6 w-full">
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <AlignLeft size={10} /> Description:
          </p>
          <p className="p-4 text-sm leading-relaxed text-text-main font-medium whitespace-pre-wrap opacity-90 font-mono">
            {assignmentData.description ||
              "No additional instructions provided."}
          </p>
        </div>
        {assignmentData.starter_code && (
          <CodeBlock
            code={assignmentData.starter_code}
            isMinimizedGiven={true}
          />
        )}
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
