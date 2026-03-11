"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  Award,
  Send,
  ShieldCheck,
  Users,
  Calendar,
  FileCode,
  Trophy,
  ChevronRight,
  Download,
} from "lucide-react";

export default function AssignmentDetailsPage() {
  const { api } = useMetadata();
  const params = useParams();
  const router = useRouter();

  const courseId = params["course-id"];
  const assignmentId = params["assignment-id"];

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`assignments/${assignmentId}/`);
        setAssignment(response.data);
      } catch (error) {
        console.error("Failed to fetch assignment details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId, api]);

  if (loading) return <LoadingPage />;

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-error font-medium">Assignment not found.</p>
      </div>
    );
  }

  const nav = (path) =>
    router.push(`/app/faculty/${courseId}/assignments/${assignmentId}/${path}`);

  const deadline = new Date(assignment.deadline);
  const isOverdue = deadline < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-5">
      {/* ── PAGE HEADER ── */}
      <div className="bg-surface rounded-md shadow-subtle border border-border overflow-hidden">
        <div className="h-1 bg-primary w-full" />
        <div className="p-6 sm:p-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              {assignment.is_grouped ? (
                <>
                  <Users size={11} /> Group
                </>
              ) : (
                "Individual"
              )}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${
                isOverdue
                  ? "bg-error/10 text-error border-error/20"
                  : "bg-secondary/10 text-secondary border-secondary/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOverdue ? "bg-error" : "bg-secondary animate-pulse"
                }`}
              />
              {isOverdue ? "Past Due" : "Active"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-h1 mb-5">{assignment.name}</h1>

          {/* Meta strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Calendar size={14} className="text-secondary flex-none" />
              <span>
                Due{" "}
                <span className="font-semibold text-accent">
                  {deadline.toLocaleDateString([], { dateStyle: "medium" })}
                </span>
                {" at "}
                <span className="font-semibold text-accent">
                  {deadline.toLocaleTimeString([], { timeStyle: "short" })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Trophy size={14} className="text-secondary flex-none" />
              <span>
                <span className="font-semibold text-accent">
                  {assignment.max_points_allowed}
                </span>{" "}
                points possible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <div className="bg-surface rounded-md shadow-subtle border border-border overflow-hidden">
        <div className="px-6 sm:px-8 py-4 border-b border-border">
          <h2 className="text-subheading text-sm">Description</h2>
        </div>
        <div className="px-6 sm:px-8 py-6">
          {assignment.description ? (
            <p className="text-body whitespace-pre-wrap">
              {assignment.description}
            </p>
          ) : (
            <p className="text-caption">
              No description provided for this assignment.
            </p>
          )}
        </div>
      </div>

      {/* ── MANAGEMENT ACTIONS ── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-3 px-1">
          Management
        </p>
        <div
          className={`grid gap-3 ${
            assignment.is_grouped
              ? "grid-cols-2 sm:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          <NavCard
            icon={<ShieldCheck size={18} />}
            label="Test Cases"
            description="Automated tests"
            onClick={() => nav("test-cases")}
          />
          <NavCard
            icon={<Award size={18} />}
            label="Rubrics"
            description="Grading criteria"
            onClick={() => nav("rubrics")}
          />
          <NavCard
            icon={<Send size={18} />}
            label="Submissions"
            description="Student work"
            onClick={() => nav("submissions")}
          />
          {assignment.is_grouped && (
            <NavCard
              icon={<Users size={18} />}
              label="Groups"
              description="Student groups"
              onClick={() => nav("groups")}
              gold
            />
          )}
        </div>
      </div>

      {/* ── FOOTER ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Starter Code */}
        <div className="bg-surface rounded-md shadow-subtle border border-border p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-3">
            Starter Resources
          </p>
          {assignment.starter_code ? (
            <a
              href={assignment.starter_code}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded bg-background border border-border hover:border-secondary transition-all group"
            >
              <div className="p-2 rounded bg-primary/10 text-primary">
                <FileCode size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-accent truncate">
                  Starter_Code.zip
                </p>
                <p className="text-xs text-text-muted">Click to download</p>
              </div>
              <Download
                size={14}
                className="text-text-muted group-hover:text-secondary transition-colors flex-none"
              />
            </a>
          ) : (
            <p className="text-caption italic text-sm">
              No starter code uploaded.
            </p>
          )}
        </div>

        {/* System ID */}
        <div className="bg-surface rounded-md shadow-subtle border border-border p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-3">
            System ID
          </p>
          <code className="block text-xs font-mono text-text-muted bg-background border border-border rounded p-3 break-all leading-relaxed">
            {assignment.id}
          </code>
        </div>
      </div>
    </div>
  );
}

// ── NAV CARD ──
function NavCard({ icon, label, description, onClick, gold = false }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer group w-full text-left bg-surface rounded-md border border-border shadow-subtle p-5 hover:border-primary hover:shadow-md transition-all duration-150 active:scale-[0.98]"
    >
      <div
        className={`inline-flex p-2 rounded mb-4 ${
          gold ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-accent">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
        <ChevronRight
          size={14}
          className="text-border group-hover:text-primary transition-colors flex-none mb-0.5"
        />
      </div>
    </button>
  );
}
