import React from "react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md text-center">
        {/* Visual Identity: Shield/Lock Graphic */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* The Gold "401" Watermark */}
            <h1 className="select-none text-9xl font-extrabold text-secondary opacity-20">
              401
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Maroon Emphasis Mark */}
              <span className="text-h1 !text-primary m-0">!</span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <p className="text-subheading mb-2">Halt, Warhawk</p>
        <h2 className="text-h2 border-none pb-0 mb-4 text-accent">
          Access Denied
        </h2>
        <p className="text-body mb-8">
          It looks like you don&apos;t have the proper credentials to view this
          area. Please sign in with an authorized <strong>ULM account</strong>{" "}
          to continue.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-md bg-primary px-8 py-3 text-sm font-bold text-white shadow-subtle transition-transform hover:scale-105 active:scale-95"
          >
            Sign In
          </Link>

          <Link
            href="/"
            className="rounded-md border border-border bg-surface px-8 py-3 text-sm font-semibold text-text-main hover:bg-slate-50"
          >
            Go Home
          </Link>
        </div>

        {/* Technical Reference */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-caption">
            Unauthorized Access Ref:{" "}
            <code className="code-main">ERR_401_WARHAWK</code>
          </p>
        </div>
      </div>
    </div>
  );
}
