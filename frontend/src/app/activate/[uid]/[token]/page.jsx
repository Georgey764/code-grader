"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingPage } from "@/components/ui/sections";

const baseUrl = process.env.NEXT_PUBLIC_URL;

function formatErrorDetail(body) {
  if (!body) return "Account activation failed.";
  let d = body.detail;
  if (Array.isArray(d)) {
    d = d
      .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
      .join(" ");
  }
  if (typeof d === "object" && d !== null) {
    return JSON.stringify(d);
  }
  if (typeof d === "string") return d;
  return "Account activation failed.";
}

function helpForMessage(msg) {
  const low = (msg || "").toLowerCase();
  if (low.includes("stale")) {
    return "Activation links expire after a while, and only the latest link stays valid if a new email was sent. On the login page, enter your email and password — if the account is not activated yet, you will see an option to resend a fresh activation email.";
  }
  if (low.includes("already") && low.includes("activ")) {
    return "You can go straight to login.";
  }
  return null;
}

export default function ActivatePage() {
  const { uid, token } = useParams();
  const [error, setError] = useState(null);
  const [helpText, setHelpText] = useState(null);
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

        if (!response.ok) {
          const errorData =
            response.status !== 204
              ? await response.json().catch(() => ({}))
              : {};
          const msg = formatErrorDetail(errorData);
          setHelpText(helpForMessage(msg));
          throw new Error(msg);
        }

        if (response.status !== 204) {
          await response.json().catch(() => null);
        }
      } catch (err) {
        console.error("Activation Error:", err);
        setError(err.message || "Account activation failed.");
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
        className="flex flex-col items-center justify-center min-h-screen px-4"
        role="alert"
      >
        <h1 className="text-2xl font-bold text-center">Account activation failed</h1>
        <p className="text-sm text-red-600 mt-3 max-w-md text-center">{error}</p>
        {helpText ? (
          <p className="text-sm text-text-muted mt-4 max-w-lg text-center leading-relaxed">
            {helpText}
          </p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            className="text-primary font-semibold hover:underline text-center"
            href="/login"
          >
            Go to login (resend activation from there)
          </Link>
          <Link
            className="text-secondary font-semibold hover:underline text-center"
            href="/register"
          >
            Register a new account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4"
      role="status"
    >
      <h1 className="text-2xl font-bold">Account activated successfully</h1>
      <p className="text-sm text-text-muted mt-2">You can sign in now.</p>
      <Link
        className="mt-6 text-primary font-semibold hover:underline"
        href="/login"
      >
        Login
      </Link>
    </div>
  );
}
