"use client";

import React from "react";
import { Terminal, Loader2 } from "lucide-react";

/** Shown while the create-submission request runs (upload + synchronous grading). */
export default function PollingView() {
  return (
    <div className="py-10 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Loader2 size={20} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-black text-accent uppercase tracking-tighter leading-none">
                Grading submission
              </h2>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                <Terminal size={10} className="text-secondary" />
                Running automated tests — this usually takes a few seconds
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          Please keep this tab open until results appear.
        </p>
      </div>
    </div>
  );
}
