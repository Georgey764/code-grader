"use client";

import React from "react";
import {
  Settings,
  CloudUpload,
  Terminal,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function PollingView({ status, progress }) {
  // Logic from your original component
  const currentProgress = status === "uploading" ? 30 : progress;

  return (
    <section className="bg-surface p-8 sm:p-12 rounded-xl border border-border shadow-subtle text-center relative overflow-hidden animate-in fade-in duration-500">
      {/* Background Scanning Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_0%,var(--primary)_50%,transparent_100%)] bg-[length:100%_200%] animate-[loading_4s_linear_infinite]" />

      <div className="relative z-10 max-w-md mx-auto">
        {/* --- Visual Icon Core --- */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="relative">
            {/* Rotating Gear behind the status icon */}
            <Settings
              size={80}
              className="text-secondary/20 animate-[spin_8s_linear_infinite]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {status === "uploading" ? (
                <CloudUpload
                  size={32}
                  className="text-primary animate-bounce"
                />
              ) : (
                <Activity size={32} className="text-primary animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* --- Status Text --- */}
        <div className="space-y-2 mb-8">
          <h2 className="text-h2 border-none pb-0 text-xl sm:text-2xl uppercase tracking-tighter text-accent">
            {status === "uploading"
              ? "Transferring Data..."
              : "Executing Test Suite..."}
          </h2>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
            <Terminal size={12} />
            <span>Environment: Production-v3</span>
          </div>
        </div>

        {/* --- Enhanced Progress Bar --- */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {status === "uploading" ? "Upload Progress" : "Validation"}
            </span>
            <span className="text-xs font-mono font-bold text-primary">
              {currentProgress}%
            </span>
          </div>

          <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border/50 p-0.5 shadow-inner">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${currentProgress}%` }}
            >
              {/* Glossy highlight on the bar */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[loading_1.5s_infinite]" />
            </div>
          </div>
        </div>

        {/* --- Safety Notice --- */}
        <div className="mt-10 flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-lg border border-dashed border-border">
          <ShieldCheck size={18} className="text-text-muted shrink-0" />
          <p className="text-left text-[11px] leading-relaxed text-text-muted">
            <strong className="text-accent uppercase block mb-0.5">
              Stability Protocol
            </strong>
            Please do not refresh or close this tab. Our containers are actively
            analyzing your source code.
          </p>
        </div>
      </div>
    </section>
  );
}
