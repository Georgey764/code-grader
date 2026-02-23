"use client";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  ArrowLeft,
  Hash,
  ShieldCheck,
  ChevronRight,
  Activity,
  ClipboardList,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { LoadingPage } from "@/components/ui/sections";
import { BackButton } from "@/components/ui/elements";
import { useMetadata } from "@/context";

const Page = () => {
  const router = useRouter();
  const { "course-id": courseId } = useParams();
  const [course, setCourse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { api } = useMetadata();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`courses/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        alert(`Error fetching courses`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [api, courseId]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <main className="flex-1 transition-all duration-300 p-4 w-full">
      {/* Navigation Breadcrumb */}
      <BackButton link="/faculty" name={`${course?.short_name}`} />

      {/* Course Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded text-xs font-black uppercase tracking-widest border border-secondary/20">
                {course?.short_name}
              </span>
              <div className="flex items-center gap-1 text-text-muted text-xs font-mono">
                <Hash size={14} /> CRN: {course?.crn}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-primary leading-tight">
              {course?.name}
            </h1>
          </div>

          {/* Course Status Badge */}
          {/* <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${
              course.is_active
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-error border-error/20"
            }`}
          >
            <Activity size={14} />{" "}
            {course.is_active ? "Active Course" : "Inactive"}
          </div> */}
        </div>
        <div className="h-[2px] bg-secondary w-24 mt-6" />
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Metadata */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface p-8 rounded-lg border border-border shadow-subtle">
            <h3 className="text-h2 mb-6 uppercase tracking-tighter">
              About this Course
            </h3>
            <p className="text-body text-text-main leading-relaxed">
              {course?.description}
            </p>
          </section>

          {/* Quick Stats/Meta Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-accent text-white p-5 rounded-lg flex items-center gap-4">
              <ShieldCheck className="text-secondary" size={24} />
              <div>
                <p className="text-[10px] uppercase text-white/50 tracking-widest">
                  Faculty
                </p>
                <p className="font-mono text-xs truncate max-w-[180px]">
                  {course?.faculty_profile?.first_name}{" "}
                  {course?.faculty_profile?.last_name}
                </p>
              </div>
            </div>
            <div className="bg-surface border border-border p-5 rounded-lg flex items-center gap-4">
              <BookOpen className="text-primary" size={24} />
              <div>
                <p className="text-[10px] uppercase text-text-muted tracking-widest">
                  Academic Code
                </p>
                <p className="font-bold text-accent">{course?.short_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Navigation Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] px-2">
            Navigation
          </h3>

          {/* Go to Assignments */}
          <button
            onClick={() => router.push(`${courseId}/assignments`)}
            className="cursor-pointer w-full group bg-surface hover:bg-primary hover:border-primary p-6 rounded-lg border border-border shadow-subtle transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 group-hover:bg-white/10 rounded-md text-primary group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-accent group-hover:text-white uppercase tracking-tight">
                  Assignments
                </p>
                <p className="text-xs text-text-muted group-hover:text-white/60">
                  View all coursework
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-text-muted group-hover:text-white"
              size={20}
            />
          </button>
          <button
            onClick={() => router.push(`${courseId}/groups`)}
            className="cursor-pointer w-full group bg-surface hover:bg-primary hover:border-primary p-6 rounded-lg border border-border shadow-subtle transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 group-hover:bg-white/10 rounded-md text-primary group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-accent group-hover:text-white uppercase tracking-tight">
                  Groups
                </p>
                <p className="text-xs text-text-muted group-hover:text-white/60">
                  Manage student teams
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-text-muted group-hover:text-white"
              size={20}
            />
          </button>

          {/* NEW: Go to Roster */}
          <button
            onClick={() => router.push(`${courseId}/roster`)}
            className="cursor-pointer w-full group bg-surface hover:bg-primary hover:border-primary p-6 rounded-lg border border-border shadow-subtle transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 group-hover:bg-white/10 rounded-md text-primary group-hover:text-white transition-colors">
                <ClipboardList size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-accent group-hover:text-white uppercase tracking-tight">
                  Roster
                </p>
                <p className="text-xs text-text-muted group-hover:text-white/60">
                  View enrolled students
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-text-muted group-hover:text-white"
              size={20}
            />
          </button>
        </div>
      </div>
    </main>
  );
};

export default Page;
