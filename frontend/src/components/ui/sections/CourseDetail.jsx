"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  FileText,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  Share2,
  BookOpen,
  Users,
} from "lucide-react";

const role_converter = { st: "student", ga: "faculty", fa: "faculty" };

const Page = () => {
  const router = useRouter();
  const { "course-id": courseId } = useParams();
  const { api, user } = useMetadata();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const role = user?.role?.toLowerCase();
  const isFaculty = role !== "st";

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`courses/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [api, courseId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(courseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <LoadingPage />;
  if (!course) return <div className="p-8 text-error">Course not found.</div>;

  return (
    <div className="mx-auto space-y-5">
      {/* ── HEADER ── */}
      <div className="bg-surface rounded-md shadow-subtle border border-border overflow-hidden">
        <div className="h-1 bg-primary w-full" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              {course.short_name}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/30">
              CRN: {course.crn}
            </span>
          </div>
          <h1 className="text-h1">{course.name}</h1>
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <div className="bg-surface rounded-md shadow-subtle border border-border overflow-hidden">
        <div className="px-6 sm:px-8 py-4 border-b border-border">
          <h2 className="text-subheading text-sm">Course Overview</h2>
        </div>
        <div className="px-6 sm:px-8 py-6">
          <p className="text-body leading-relaxed whitespace-pre-wrap">
            {course.description || "No description provided for this course."}
          </p>
        </div>
      </div>

      {/* ── QUICK INFO ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* <InfoTile
          icon={<ShieldCheck size={16} className="text-primary" />}
          label="Instructor"
          value={course?.faculty_profile?.first_name || "Not assigned"}
        /> */}
        <InfoTile
          icon={<BookOpen size={16} className="text-primary" />}
          label="Course Code"
          value={course.short_name}
        />
      </div>

      {/* ── ACTIONS ── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-3 px-1">
          Navigation
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NavCard
            icon={<FileText size={18} />}
            label="Assignments"
            description="View all assignments"
            onClick={() =>
              router.push(
                `/app/${role_converter[role]}/${role === "st" ? "courses/" : ""}${courseId}/assignments`,
              )
            }
            primary
          />
          {isFaculty && (
            <NavCard
              icon={<Users size={18} />}
              label="Class Roster"
              description="Manage enrolled students"
              onClick={() => router.push(`/app/faculty/${courseId}/roster`)}
            />
          )}
        </div>
      </div>

      {/* ── INVITE (faculty only) ── */}
      {isFaculty && (
        <div className="bg-surface rounded-md shadow-subtle border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={14} className="text-secondary" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
              Invite Students
            </p>
          </div>
          <p className="text-xs text-text-muted mb-3">
            Share this Course ID with students to let them enroll.
          </p>
          <button
            onClick={handleCopy}
            className="cursor-pointer w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded hover:border-secondary transition-colors group"
          >
            <code className="text-sm font-mono text-accent truncate mr-3">
              {courseId}
            </code>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-text-muted group-hover:text-secondary transition-colors flex-none">
              {copied ? (
                <>
                  <Check size={13} className="text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── INFO TILE ──
function InfoTile({ icon, label, value }) {
  return (
    <div className="bg-surface rounded-md shadow-subtle border border-border p-5 flex items-center gap-4">
      <div className="p-2 rounded bg-primary/10 flex-none">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-accent truncate">{value}</p>
      </div>
    </div>
  );
}

// ── NAV CARD ──
function NavCard({ icon, label, description, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer group w-full text-left rounded-md border shadow-subtle p-5 transition-all duration-150 active:scale-[0.98] ${
        primary
          ? "bg-primary border-primary text-white hover:bg-accent hover:border-accent"
          : "bg-surface border-border hover:border-primary"
      }`}
    >
      <div
        className={`inline-flex p-2 rounded mb-4 ${
          primary ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p
            className={`text-sm font-bold ${
              primary ? "text-white" : "text-accent"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              primary ? "text-white/70" : "text-text-muted"
            }`}
          >
            {description}
          </p>
        </div>
        <ChevronRight
          size={14}
          className={`flex-none mb-0.5 transition-colors ${
            primary
              ? "text-white/50 group-hover:text-white"
              : "text-border group-hover:text-primary"
          }`}
        />
      </div>
    </button>
  );
}

export default Page;
