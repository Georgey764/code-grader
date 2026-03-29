"use client";

import React from "react";
import { Terminal, Activity, Loader2 } from "lucide-react";

export default function PollingView({ status, progress }) {
  const currentProgress = status === "uploading" ? 30 : progress;

  return (
    <div className="py-10 animate-in fade-in duration-500">
      <div className="space-y-6">
        {/* 1. Status Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              {status === "uploading" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Activity size={20} className="animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-accent uppercase tracking-tighter leading-none">
                {status === "uploading" ? "Uploading Source" : "Testing Code"}
              </h2>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                <Terminal size={10} className="text-secondary" />
                System: Production-v3
              </p>
            </div>
          </div>

          <span className="text-xl font-black text-primary font-mono">
            {currentProgress}%
          </span>
        </div>

        {/* 2. Flat Progress Bar */}
        <div className="space-y-3">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          {/* 3. Minimalist Protocol Note */}
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Stability Protocol: Active analysis in progress. Do not refresh.
          </p>
        </div>
      </div>
    </div>
  );
}
