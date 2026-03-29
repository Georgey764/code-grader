"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMetadata } from "@/context";

export default function useRouteToCorrectPath() {
  const { user, isLoading } = useMetadata();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role == "FA") {
        router.push("/dashboard/faculty");
      }
      if (user.role == "ST") {
        router.push("/dashboard/student");
      }
    }
  }, [user, router]);

  return { user, isLoading };
}
