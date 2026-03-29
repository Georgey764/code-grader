"use client";

import { useMetadata } from "@/context";
import { useEffect, useState } from "react";
import { CourseCard, Button, NoItemFound } from "@/components/ui/elements";
import { LoadingPage } from "@/components/ui/sections";

export default function Page() {
  const { api, user } = useMetadata();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`courses/`);
        setCourses(response?.data || []);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.cwid) fetchPageData();
  }, [api, user?.cwid]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))
      ) : (
        <div className="col-span-full">
          <NoItemFound name="courses" />
        </div>
      )}
    </div>
  );
}
