"use client";

import { Button, Input, Card } from "@/components/ui/elements";

import { jwtDecode } from "jwt-decode";
import { LoadingPage } from "@/components/ui/sections";
import { useRouteToCorrectPath } from "@/hooks";
import { useMetadata } from "@/context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, isLoading } = useRouteToCorrectPath();
  const { name, author, baseUrl } = useMetadata();
  const router = useRouter();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Brand Header */}
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
            try {
              const response = await fetch(baseUrl + "token/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  email: form.email.value,
                  password: form.password.value,
                }),
              });
              const data = await response.json();
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
                  router.push("/faculty");
                } else if (role == "ST") {
                  router.push("/student/courses");
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
                href="#"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>
          </div>

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

      {/* Footer Branding */}
      <footer className="mt-12 text-text-muted text-xs uppercase tracking-widest">
        {author}
      </footer>
    </div>
  );
}
