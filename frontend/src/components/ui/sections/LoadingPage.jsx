import React from "react";

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="relative flex flex-col items-center">
        {/* Animated Warhawk Spinner */}
        <div className="relative mb-8">
          {/* Outer Gold Ring */}
          <div className="h-24 w-24 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />

          {/* Inner Maroon Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-primary animate-pulse opacity-80" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h2 className="text-h2 border-none pb-0 mb-2 animate-pulse">
            Compiling...
          </h2>
          <p className="text-subheading text-xs tracking-[0.3em]">
            Preparing your environment
          </p>
        </div>

        {/* Progress Bar (Simulated) */}
        <div className="animate-loading mt-8 h-1 w-48 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/3 animate-[loading_2s_ease-in-out_infinite] bg-primary" />
        </div>
      </div>
    </div>
  );
}
