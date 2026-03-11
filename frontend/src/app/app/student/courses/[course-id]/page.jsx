"use client";
import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";
import { LoadingPage, CourseDetail } from "@/components/ui/sections";
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

  return <CourseDetail />;
};

export default Page;
