"use client";

import { MoreVertical, Book, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CourseList = ({ course, role }) => {
  const router = useRouter();

  return (
    <>
      {course.is_active && (
        <div
          onClick={() =>
            role?.toLowerCase() == "st"
              ? router.push(`/student/courses/${course.id}`)
              : router.push(`/faculty/${course.id}`)
          }
          key={course.id}
          className="cursor-pointer group relative flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-surface border border-border rounded-md shadow-subtle hover:border-secondary transition-all"
        >
          {/* Main Info Section */}
          <div className="flex items-start gap-5 w-full md:w-auto">
            <div className="mt-1 p-3 bg-primary/5 rounded-lg text-primary">
              <Book size={24} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-bold text-primary uppercase tracking-tighter">
                  {course.short_name}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  <Hash size={12} /> {course.crn}
                </span>
                {/* Active/Inactive Badge */}
                {/* {course.is_active ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                    <CheckCircle2 size={12} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-error font-bold uppercase">
                    <XCircle size={12} /> Inactive
                  </span>
                )} */}
              </div>

              <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                {course.name}
              </h3>
              <p className="text-sm text-text-muted mt-1 line-clamp-1 max-w-xl">
                {course.description}
              </p>
            </div>
          </div>

          {/* Action/Meta Section */}
          <div className="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/50 gap-6">
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                Faculty
              </span>
              <span className="text-xs font-mono text-accent truncate max-w-[100px] md:max-w-none">
                {course.faculty_profile.title}{" "}
                {course.faculty_profile.first_name}{" "}
                {course.faculty_profile.last_name}
              </span>
            </div>

            {/* <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button> */}
          </div>
        </div>
      )}
    </>
  );
};

export default CourseList;
