"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Hash, Info, User, Mail, Share2, Copy, Check } from "lucide-react";

const Page = () => {
  const { "course-id": courseId } = useParams();
  const { api, user } = useMetadata();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isFaculty = user?.role?.toLowerCase() !== "st";

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`courses/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        console.error("Sync error:", err);
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
  if (!course)
    return (
      <div className="p-8 text-center font-black uppercase text-text-muted">
        Course metadata not found.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* 1. TYPOGRAPHIC HEADER */}
      <header className="pb-8 border-b-2 border-primary/10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded">
              {course.short_name}
            </span>
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">
              CRN {course.crn}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-accent uppercase tracking-tighter leading-none">
            {course.name}
          </h1>
        </div>
      </header>

      {/* 2. MINIMALIST TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main: Syllabus / Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Info size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest">
              Syllabus Overview
            </h2>
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-sm md:text-base leading-relaxed text-text-main whitespace-pre-wrap font-medium">
              {course.description ||
                "No official course description has been uploaded for this section yet."}
            </p>
          </div>
        </div>

        {/* Sidebar: Essential Staff & Join Info */}
        <div className="space-y-6">
          {/* Consolidated Instructor Card */}
          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mb-5">
              Lead Instructor
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center shadow-inner">
                <User size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-accent truncate">
                  {course.faculty_profile?.user?.first_name}{" "}
                  {course.faculty_profile?.user?.last_name}
                </p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                  Active • 2026
                </p>
              </div>
            </div>

            <a
              href={`mailto:${course.faculty_profile?.user?.email}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border border-border rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
            >
              <Mail size={14} /> Send Message
            </a>
          </section>

          {/* Enrollment Section (Faculty Only) */}
          {isFaculty && (
            <section className="p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 size={14} className="text-primary" />
                <p className="text-[9px] font-black uppercase text-text-muted tracking-widest">
                  Enrollment Key
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-between p-3 bg-white border border-border rounded-lg group hover:border-secondary transition-all"
              >
                <code className="text-xs font-mono font-bold text-accent truncate">
                  {courseId}
                </code>
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy
                    size={14}
                    className="text-text-muted group-hover:text-secondary"
                  />
                )}
              </button>
            </section>
          )}

          <p className="px-1 text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-40">
            Warhawk Academic Portal • Secure Context
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
