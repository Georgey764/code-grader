"use client";

import { Button, Input, Card } from "@/components/global/elements";
import useMetadata from "@/hooks/useMetadata";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const { url, name, author } = useMetadata();
  const router = useRouter();

  useEffect(() => {}, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <h1 className="text-h1 mb-2">{name}</h1>
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
              const response = await fetch(url + "token/", {
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
                  router.push("/student");
                }
              }
            } catch (e) {
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
            <span className="text-secondary font-bold cursor-pointer hover:underline">
              Register here
            </span>
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
