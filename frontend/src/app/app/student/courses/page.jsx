"use client";

import CourseList from "@/components/ui/elements/CourseList";
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
    <>
      {coursesData.length > 0 ? (
        coursesData.map((course, index) => (
          <CourseList key={index} course={course} role={user?.role} />
        ))
      ) : (
        <NoItemFound name="courses" />
      )}
    </>
  );
}
