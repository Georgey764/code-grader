"use client";

import { useState } from "react";
import { Button, Input, Card } from "@/components/ui/elements";

import { jwtDecode } from "jwt-decode";
import { LoadingPage } from "@/components/ui/sections";
import { useRouteToCorrectPath } from "@/hooks";
import { useMetadata } from "@/context";
import Link from "next/link";
import { useRouter } from "next/navigation";

function normalizeJwtErrorDetail(data) {
  if (!data) return "";
  const d = data.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    const first = d.find((x) => typeof x === "string");
    return first || "";
  }
  if (typeof d === "object" && d !== null && typeof d.detail === "string")
    return d.detail;
  return typeof data === "string" ? data : "";
}

export default function LoginPage() {
  const { user, isLoading } = useRouteToCorrectPath();
  const { name, author, baseUrl } = useMetadata();
  const router = useRouter();
  const [inactiveHint, setInactiveHint] = useState(false);
  const [inactiveMessage, setInactiveMessage] = useState("");
  const [emailForResend, setEmailForResend] = useState("");
  const [resendState, setResendState] = useState("idle"); // idle | sending | sent | error

  if (isLoading) {
    return <LoadingPage />;
  }

  if (user) {
    return null;
  }

  const resendActivation = async () => {
    const email = (emailForResend || "").trim().toLowerCase();
    if (!email) {
      alert("Enter your email address above first.");
      return;
    }
    setResendState("sending");
    try {
      const response = await fetch(baseUrl + "auth/users/resend_activation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok || response.status === 204) {
        setResendState("sent");
        return;
      }
      const data = await response.json().catch(() => ({}));
      const msg = normalizeJwtErrorDetail(data) || "Could not send email.";
      setResendState("error");
      alert(msg);
    } catch (e) {
      setResendState("error");
      alert("Network error: " + (e?.message || e));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <Link href="/">
          <h1 className="text-h1 mb-2">{name}</h1>
        </Link>
        <p className="text-subheading">Portal Access</p>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-h2 mb-2">Sign In</h2>
          <p className="text-caption">Please enter your {name} credentials</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            setInactiveHint(false);
            setInactiveMessage("");
            setResendState("idle");
            const emailVal = form.email.value.trim();
            setEmailForResend(emailVal);
            try {
              const response = await fetch(baseUrl + "auth/jwt/create/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  email: emailVal,
                  password: form.password.value,
                }),
              });

              const data = await response.json().catch(() => ({}));

              if (!response.ok) {
                const detailStr = normalizeJwtErrorDetail(data);
                if (
                  detailStr.startsWith("INACTIVE_ACCOUNT:") ||
                  detailStr.includes("not been activated")
                ) {
                  setInactiveHint(true);
                  setInactiveMessage(
                    detailStr.replace(/^INACTIVE_ACCOUNT:\s*/, "").trim(),
                  );
                  return;
                }
                alert(detailStr || "Login failed.");
                return;
              }

              if (data["detail"]) {
                alert(data.detail);
              }

              if (data["access"]) {
                const decoded = jwtDecode(data.access);

                const access_token = data.access;
                const refresh_token = data.refresh;

                const role = decoded.role;

                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", refresh_token);

                if (role == "FA") {
                  router.push("/dashboard/faculty");
                } else if (role == "ST") {
                  router.push("/dashboard/student/");
                } else if (role == "GA") {
                  router.push("/dashboard/faculty");
                }
              }
            } catch (e) {
              console.log(e);
              alert("System Error: " + e);
            }
          }}
        >
          <Input
            name="email"
            label="Email"
            type="text"
            placeholder="johndoe@email.com"
            onChange={(e) => setEmailForResend(e.target.value)}
          />

          <div className="space-y-1">
            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
            />
            <div className="flex justify-end">
              <a
                href="/password-reset"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {inactiveHint ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3"
              role="status"
            >
              <p className="text-sm text-amber-950 font-medium leading-relaxed">
                {inactiveMessage ||
                  "This account exists but is not activated yet."}
              </p>
              <p className="text-xs text-amber-900/90">
                If an older activation link says the token is stale, send a fresh
                email below and use the newest link only.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs"
                  disabled={resendState === "sending"}
                  onClick={resendActivation}
                >
                  {resendState === "sending"
                    ? "Sending…"
                    : "Resend activation email"}
                </Button>
                {resendState === "sent" ? (
                  <span className="text-xs font-bold text-emerald-700">
                    Check your inbox (and spam) for a new link.
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="pt-2">
            <Button variant="primary" type="submit">
              Log In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-body text-sm">
            Need an account?{" "}
            <a
              href="/register"
              className="text-secondary font-bold cursor-pointer hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </Card>

      <footer className="mt-12 text-text-muted text-xs uppercase tracking-widest">
        {author}
      </footer>
    </div>
  );
}
