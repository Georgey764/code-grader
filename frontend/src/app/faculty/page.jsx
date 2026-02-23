"use client";

import { useMetadata } from "@/context";
import { useEffect, useState } from "react";
import { CourseList, Button } from "@/components/ui/elements";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Page() {
  const { api, user } = useMetadata();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`accounts/faculty/${user.cwid}`);
        setCourses(response?.data?.courses || []);
      } catch (e) {
        console.error("Fetch error:", e);
      }
    };
    if (user?.cwid) fetchPageData();
  }, [api, user.cwid]);

  return (
    <div className="flex bg-background min-h-screen">
      <main className="flex-1 p-6 transition-all duration-300">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-secondary text-2xl font-bold tracking-widest uppercase">
                Courses
              </h1>
              <p className="text-text-muted italic">Welcome back, Chief.</p>
            </div>

            <Link href="/faculty/create-course">
              <Button className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity flex flex-row items-center justify-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" /> Create New Course
              </Button>
            </Link>
          </div>

          <div className="h-[1.5px] bg-border w-full mt-4 opacity-50" />
        </header>
        <div className="w-full max-w-5xl mx-auto space-y-4">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseList
                key={course.id || index}
                course={course}
                role={user.role}
              />
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-text-muted">
                No courses found. Time to build one!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
