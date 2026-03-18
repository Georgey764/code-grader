"use client";

import { Check, Copy, FileCode } from "lucide-react";
import { useState } from "react";

export default function StarterCode({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
          <FileCode size={14} /> Starter Code
        </p>

        {code !== null && code !== undefined && code !== "" && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        )}
      </div>

      <textarea
        readOnly
        value={code || "No starter code provided."}
        className="w-full min-h-[200px] p-4 rounded-xl border-2 border-border bg-slate-50/50 font-mono text-sm text-text-main leading-relaxed focus:outline-none focus:border-secondary transition-all resize-y"
      />
    </div>
  );
}
