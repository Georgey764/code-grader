"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoadingPage } from "@/components/ui/sections";
import { useMetadata } from "@/context";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { BackButton, NoItemFound } from "@/components/ui/elements";
import {
  HeadingWrapper,
  AssignmentListSection,
} from "@/components/ui/sections";

const Page = () => {
  const { "course-id": courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { api, name } = useMetadata();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get(`assignments/?course_id=${courseId}`);
        setAssignments(response?.data);
      } catch (err) {
        console.log(err?.response);
        alert(`Error fetching assignments`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [api, courseId]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return <AssignmentListSection />;
};

export default Page;
