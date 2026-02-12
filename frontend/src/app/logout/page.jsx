"use client";

import { useMetadata } from "@/context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { logout } = useMetadata();
  const router = useRouter();
  useEffect(() => {
    logout();
    router.push("/login");
  });
}
