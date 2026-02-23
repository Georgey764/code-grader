// components/AuthWrapper.js
"use client";

import { useMetadata } from "@/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingPage } from "@/components/ui/sections";

export default function RoleGuard({ children, allowedRoles = [] }) {
  const { user, isLoading } = useMetadata();
  const router = useRouter();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [allowedRoles, router, user]);

  if (isLoading) {
    return <LoadingPage />;
  } else if (!user) {
    return null;
  }

  // If useAuth redirected the user, this prevents the "protected"
  // content from flashing briefly

  if (user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
