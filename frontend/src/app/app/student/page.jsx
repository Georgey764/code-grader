"use client";

import { CourseCard } from "@/components/ui/elements";
import { useMetadata } from "@/context";
import { useState, useEffect } from "react";
import { LoadingPage, HeadingWrapper } from "@/components/ui/sections";
import { NoItemFound, CreateButton } from "@/components/ui/elements";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { api, user } = useMetadata();
  const [coursesData, setCoursesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`courses/`);
        setCoursesData(response?.data);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
      {coursesData.length > 0 ? (
        coursesData.map((course, index) => (
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
