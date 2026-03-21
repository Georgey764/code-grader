"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingPage } from "@/components/ui/sections";

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function ActivatePage({}) {
  const { uid, token } = useParams();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}auth/users/activation/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid, token }),
        });

        // 1. Handle Errors
        if (!response.ok) {
          // Try to get error details if they exist, otherwise use fallback
          const errorData =
            response.status !== 204
              ? await response.json().catch(() => ({}))
              : {};
          throw new Error(errorData.detail || "Account activation failed");
        }

        // 2. Handle Success (Check for 204 No Content)
        if (response.status === 204) {
          console.log("Activation successful (204 No Content)");
          // No need to parse JSON, just leave state as is or set success
        } else {
          const data = await response.json();
          console.log("Activation successful:", data);
        }
      } catch (error) {
        console.error("Activation Error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (uid && token) {
      fetchData();
    }
  }, [uid, token]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen"
        role="alert"
      >
        <h1 className="text-2xl font-bold">Account activation failed</h1>
        <p className="text-sm text-red-500">{error}</p>
        <Link className="text-blue-500 hover:text-blue-600" href="/register">
          Register a new account
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      role="alert"
    >
      <h1 className="text-2xl font-bold">Account activated successfully</h1>
      <Link className="text-blue-500 hover:text-blue-600" href="/login">
        Login
      </Link>
    </div>
  );
}
