"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeadingWrapper, LoadingPage } from "@/components/ui/sections";
import { useMetadata } from "@/context";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  AssignmentList,
  BackButton,
  CreateButton,
  NoItemFound,
} from "@/components/ui/elements";

const Page = () => {
  const { "course-id": courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api, name } = useMetadata();

  useEffect(() => {
    if (!courseId || assignments.length > 0) return;
    const fetchPageData = async () => {
      try {
        const response = await api.get(`assignments/?course_id=${courseId}`);
        setAssignments(response?.data);
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
    <main className="flex-1 transition-all duration-300 p-4">
      {/* Assignment List Mapping */}
      <div className="max-w-5xl space-y-4">
        {assignments.length > 0 ? (
          assignments.map((asgn, index) => (
            <AssignmentList key={index} asgn={asgn} />
          ))
        ) : (
          <NoItemFound name="assignment" />
        )}
      </div>
    </main>
  );
};

export default Page;
