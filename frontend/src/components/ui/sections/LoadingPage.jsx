"use client";

import React from "react";

export default function LoadingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      {/* 1. Simple Spinner */}
      <div className="relative mb-6 h-16 w-16 sm:h-20 sm:w-20">
        <div className="h-full w-full rounded-full border-4 border-secondary/20 border-t-primary animate-spin" />
      </div>

      {/* 2. Clean Text Stack */}
      <div className="text-center space-y-1">
        <h2 className="text-h2 border-none pb-0 text-xl sm:text-2xl uppercase tracking-tighter text-accent">
          Compiling...
        </h2>
        <p className="text-subheading text-[10px] sm:text-xs tracking-[0.2em] opacity-70">
          PREPARING ENVIRONMENT
        </p>
      </div>

      {/* 3. Minimal Progress Bar */}
      <div className="mt-8 h-1 w-40 sm:w-56 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
