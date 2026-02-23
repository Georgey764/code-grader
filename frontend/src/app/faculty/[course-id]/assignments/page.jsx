"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoadingPage } from "@/components/ui/sections";
import { useMetadata } from "@/context";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button, AssignmentList, BackButton } from "@/components/ui/elements";

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
    <main className="flex-1 transition-all duration-300 p-4">
      {/* Breadcrumb Navigation */}
      <BackButton link={`/faculty/${courseId}/`} />

      {/* Page Header */}
      <header className="mb-10">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-secondary text-2xl font-bold tracking-widest uppercase">
            Course Assignments
          </h1>
          <Link href="assignments/create-assignment">
            <Button className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity flex flex-row items-center justify-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Create New Assignment
            </Button>
          </Link>
        </div>

        <div className="h-[1.5px] bg-border w-full mt-3 opacity-50" />
      </header>

      {/* Assignment List Mapping */}
      <div className="max-w-5xl space-y-4">
        {assignments ? (
          assignments.map((asgn, index) => (
            <AssignmentList key={index} asgn={asgn} />
          ))
        ) : (
          <>No assignments found</>
        )}
      </div>
    </main>
  );
};

export default Page;
