"use client";

import CourseList from "@/components/ui/elements/CourseList";
import { useMetadata } from "@/context";
import { useState, useEffect } from "react";
import { LoadingPage } from "@/components/ui/sections";

const sampleCourses = [
  {
    id: "uuid-1",
    faculty_id: "faculty-uuid-1",
    name: "Software Engineering",
    short_name: "CSCI4060",
    crn: "10245",
    is_active: true,
    description:
      "An introduction to the software development lifecycle and modern engineering practices.",
  },
  {
    id: "uuid-2",
    faculty_id: "faculty-uuid-2",
    name: "Theory of Database Systems",
    short_name: "CSCI4055",
    crn: "10892",
    is_active: true,
    description:
      "Deep dive into relational algebra, SQL optimization, and database architecture.",
  },
  {
    id: "uuid-3",
    faculty_id: "faculty-uuid-3",
    name: "Analysis of Algorithms",
    short_name: "CSCI3000",
    crn: "11005",
    is_active: false,
    description: "Study of algorithmic complexity and efficiency.",
  },
];

export default function Page() {
  const { api, user } = useMetadata();
  const [coursesData, setCoursesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`courses/`);
        setCoursesData(response?.data);
        console.log(response?.data);
      } catch (err) {
        console.log(err.response);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageData();
  }, [api, user.cwid, setCoursesData, setIsLoading]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="flex bg-background">
      <main className="flex-1 transition-all duration-300 ">
        <header className="mb-8">
          <h1 className="text-secondary text-2xl font-bold tracking-widest uppercase mt-12 md:mt-0">
            Courses
          </h1>
          <section className="space-y-4">
            {/* Reuse the list map code from the previous step here */}
            <p className="text-text-muted italic">Welcome back, Warhawk.</p>
          </section>
          <div className="h-[1.5px] bg-border w-full mt-3 opacity-50" />
        </header>
        <div className="w-full max-w-5xl mx-auto space-y-4">
          {coursesData ? (
            coursesData.map((course, index) => (
              <CourseList key={index} course={course} />
            ))
          ) : (
            <div>No Courses Found</div>
          )}
        </div>
      </main>
    </div>
  );
}
