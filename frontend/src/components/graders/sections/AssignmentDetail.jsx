"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { StarterCode } from "@/components/ui/elements";
import {
  FileCode,
  Copy,
  Check,
  Award,
  Send,
  ShieldCheck,
  Users,
  Calendar,
  Trophy,
  Download,
  Terminal,
  Clock,
  User,
  Hash,
} from "lucide-react";

export default function AssignmentDetailsPage() {
  const { api } = useMetadata();
  const { "course-id": courseId, "assignment-id": assignmentId } = useParams();
  const router = useRouter();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`assignments/${assignmentId}/`);
        setAssignment(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId, api]);

  if (loading) return <LoadingPage />;
  if (!assignment)
    return (
      <div className="p-10 text-center font-black uppercase text-text-muted">
        Not found.
      </div>
    );

  const nav = (path) =>
    router.push(`/app/faculty/${courseId}/assignments/${assignmentId}/${path}`);

  return (
    <div className="max-w-5xl animate-in fade-in duration-500 pb-10">
      {/* 1. COMPACT HEADER */}
      <header className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-accent uppercase tracking-tighter mb-4">
          {assignment.name}
        </h1>

        {/* 2. FLAT META STRIP */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <MetaItem
            icon={<Clock size={12} />}
            label="Due"
            value={new Date(assignment.deadline).toLocaleDateString()}
          />
          <MetaItem
            icon={<Trophy size={12} />}
            label="Is Weighted"
            value={`${assignment.is_weighted}`}
          />
          <MetaItem
            icon={<Terminal size={12} />}
            label="Runtime"
            value={assignment.language === "python" ? "Python" : "Java"}
          />
          <MetaItem
            icon={<User size={12} />}
            label="Mode"
            value={assignment.is_grouped ? "Group" : "Individual"}
          />
        </div>
      </header>

      {/* 3. UTILITY TOOLBAR */}
      <div className="flex flex-wrap gap-2 mb-8">
        <NavBtn
          label="Submissions"
          icon={<Send size={14} />}
          onClick={() => nav("submissions")}
          primary
        />
        <NavBtn
          label="Rubrics"
          icon={<Award size={14} />}
          onClick={() => nav("rubrics")}
        />
        <NavBtn
          label="Test Cases"
          icon={<ShieldCheck size={14} />}
          onClick={() => nav("test-cases")}
        />
        {assignment.is_grouped && (
          <NavBtn
            label="Groups"
            icon={<Users size={14} />}
            onClick={() => nav("groups")}
          />
        )}
      </div>

      {/* 4. CONTENT AREA */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
            <FileCode size={14} /> Assignment Description
          </p>
          <div className="text-sm md:text-base leading-relaxed text-text-main font-medium whitespace-pre-wrap opacity-90">
            {assignment.description || "No description provided."}
          </div>
        </div>

        {/* 5. MINIMAL STARTER CODE LINK */}
        <StarterCode code={assignment.starter_code} />
      </div>
    </div>
  );
}

/** * UI Sub-components */

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
      <span className="text-secondary">{icon}</span>
      <span>{label}:</span>
      <span className="text-accent">{value}</span>
    </div>
  );
}

function NavBtn({ label, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all border ${
        primary
          ? "bg-primary border-primary text-white shadow-sm hover:bg-accent"
          : "bg-white border-border text-text-muted hover:border-primary hover:text-primary"
      }`}
    >
      {icon} {label}
    </button>
  );
}
