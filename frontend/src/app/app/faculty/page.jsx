"use client";

import { useMetadata } from "@/context";
import { useEffect, useState } from "react";
import { CourseList, Button, NoItemFound } from "@/components/ui/elements";
import { HeadingWrapper } from "@/components/ui/sections";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Page() {
  const { api, user } = useMetadata();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`courses/`);
        setCourses(response?.data || []);
      } catch (e) {
        console.error("Fetch error:", e);
      }
    };
    if (user?.cwid) fetchPageData();
  }, [api, user?.cwid]);

  return (
    <div className="pt-6 md:pt-0">
      <div className="flex bg-background">
        <div className="w-full mx-auto space-y-4">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseList key={index} course={course} role={user.role} />
            ))
          ) : (
            <NoItemFound name="courses" />
          )}
        </div>
      </div>
    </div>
  );
}
