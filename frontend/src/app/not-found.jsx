import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md text-center">
        {/* Visual Identity: The "Empty Nest" Graphic */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* The Gold "404" Watermark */}
            <h1 className="select-none text-9xl font-extrabold text-secondary opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Maroon Emphasis Mark */}
              <span className="text-h1 !text-primary m-0">?</span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <p className="text-subheading mb-2">Lost in Flight</p>
        <h2 className="text-h2 border-none pb-0 mb-4 text-accent">
          Page Not Found
        </h2>
        <p className="text-body mb-8">
          The page you are looking for has flown the coop, changed its name, or
          is temporarily unavailable. Let’s get you back to familiar skies.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-md bg-primary px-8 py-3 text-sm font-bold text-white shadow-subtle transition-transform hover:scale-105 active:scale-95"
          >
            Back to Home
          </Link>
        </div>

        {/* Technical Reference */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-caption">
            Resource Not Found:{" "}
            <code className="code-main">ERR_404_WARHAWK</code>
          </p>
        </div>
      </div>
    </div>
  );
}
