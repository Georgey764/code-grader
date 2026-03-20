"use client";

import { Book, Hash, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context";

const CourseCard = ({ course }) => {
  const router = useRouter();
  const { user } = useMetadata();
  const role = user?.role?.toLowerCase();

  const navigateToCourse = () => {
    if (role === "st" || role === "ga") {
      router.push(`/dashboard/student/${course.id}`);
    } else {
      router.push(`/dashboard/faculty/${course.id}`);
    }
  };

  if (!course?.is_active) return null;

  return (
    <div
      onClick={navigateToCourse}
      className="group cursor-pointer bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-secondary transition-all flex flex-col h-full w-full"
    >
      {/* Header Banner */}
      <div className="relative h-32 bg-primary flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="absolute top-3 left-4 flex gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-primary text-[9px] font-black uppercase tracking-widest rounded shadow-sm">
            {course.short_name}
          </span>
          <span className="px-2 py-1 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1">
            <Hash size={10} /> {course.crn}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Book
            size={40}
            className="text-white/20 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-black text-accent uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
          {course.name}
        </h3>

        <p className="text-xs text-text-muted mt-3 line-clamp-3 leading-relaxed flex-1">
          {course.description || "View syllabus and course requirements."}
        </p>

        {/* Footer Meta */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg text-text-muted">
              {role === "ga" ? <ShieldCheck size={14} /> : <User size={14} />}
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-1">
                {role === "ga" ? "Assigned GA" : "Instructor"}
              </span>
              <span className="text-[11px] font-bold text-accent truncate max-w-[100px]">
                {course.faculty_profile?.user?.last_name || "Faculty"}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
