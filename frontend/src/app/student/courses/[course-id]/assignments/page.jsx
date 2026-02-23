"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoadingPage } from "@/components/ui/sections";
import { useMetadata } from "@/context";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AssignmentList, BackButton } from "@/components/ui/elements";
import { HeadingWrapper } from "@/components/ui/sections";

const Page = () => {
  const { "course-id": courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api, name } = useMetadata();

  useEffect(() => {
    if (!courseId || assignments.length > 0) return;
    const fetchPageData = async () => {
      try {
        const response = await api.get(`courses/${courseId}/`);
        setAssignments(response?.data?.assignments);
      } catch (err) {
        alert(`Error fetching assignments`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [api, courseId, assignments.length]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <BackButton link={`/student/courses/${courseId}/`} />
      <HeadingWrapper name="Assignment List">
        <div className="max-w-5xl space-y-4">
          {assignments ? (
            assignments.map((asgn, index) => (
              <AssignmentList key={index} asgn={asgn} />
            ))
          ) : (
            <>No assignments found</>
          )}
        </div>
      </HeadingWrapper>
    </>
  );
};

export default Page;
