"use client";

import { useState } from "react";
import { LoadingPage } from "@/components/ui/sections";
import { useRouteToCorrectPath } from "@/hooks";
import { useMetadata } from "@/context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [role, setRole] = useState("student");
  const { baseUrl } = useMetadata();
  const { user, isLoading } = useRouteToCorrectPath();
  const router = useRouter();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (user) {
    return null;
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const fetchHandle = async () => {
      const bodyToSend = {
        email: form.email.value,
        password: form.password.value,
        password_confirm: form.password.value,
        role: form.role.value,
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        cwid: form.cwid.value,
      };

      if (form.role.value == "FA") {
        bodyToSend["title"] = form.title.value;
        bodyToSend["phone"] = form.phone.value;
      }
      if (form.role.value == "ST") {
        bodyToSend["major"] = form.major.value;
        bodyToSend["classification"] = form.classification.value;
      }

      const response = await fetch(baseUrl + "accounts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyToSend),
      });

      const data = await response.json();

      alert("Registered Succesfully!");
      router.push("/login");
    };

    try {
      fetchHandle();
    } catch (e) {
      console.log(e);
    }

    // console.log("Form submitted for role:", role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl bg-surface rounded-md shadow-subtle border border-border overflow-hidden">
        {/* Branding Header */}
        <div className="bg-primary p-8 text-center">
          <Link href="/">
            <h1 className="text-white text-3xl font-extrabold tracking-tight uppercase">
              Warhawk Code Grader
            </h1>
          </Link>
          <p className="text-secondary font-medium mt-2">
            Create your academic account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Identity Fields */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-text-main">
                First Name
              </label>
              <input
                name="first_name"
                type="text"
                placeholder="Ace"
                className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-text-main">
                Last Name
              </label>
              <input
                name="last_name"
                type="text"
                placeholder="Warhawk"
                className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-text-main">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="warhawk@ulm.edu"
                className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-text-main">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-text-main">CWID</label>
              <input
                name="cwid"
                type="text"
                placeholder="12345678"
                className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                required
              />
            </div>

            {/* Role Selection (Student vs Faculty) */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-bold text-text-main">
                Account Type
              </label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="ST"
                    checked={role === "ST"}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-body">Student</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="FA"
                    checked={role === "FA"}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-body">Faculty</span>
                </label>
              </div>
            </div>

            <hr className="md:col-span-2 border-border" />

            {/* Student Specific Fields */}
            {role === "ST" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-text-main">
                    Major
                  </label>
                  <input
                    name="major"
                    type="text"
                    placeholder="Computer Science"
                    className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-text-main">
                    Classification
                  </label>
                  <select
                    name="classification"
                    className="w-full p-2 border border-border rounded-sm bg-white focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="">Select Year</option>
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>
              </>
            )}

            {/* Faculty Specific Fields */}
            {role === "FA" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-text-main">
                    Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="Assistant Professor"
                    className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-text-main">
                    Office Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="(318) 342-0000"
                    className="w-full p-2 border border-border rounded-sm focus:ring-2 focus:ring-secondary outline-none"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-all shadow-subtle uppercase tracking-wider"
          >
            Register Account
          </button>

          <p className="text-center text-caption pt-4">
            Already have an account?{" "}
            <a href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
