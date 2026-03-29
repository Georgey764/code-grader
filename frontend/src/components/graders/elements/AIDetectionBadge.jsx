"use client";

import React from "react";
import { Info } from "lucide-react";

const DISCLAIMER =
  "AI predictions are probabilistic and should be used to guide manual review, not as absolute proof of academic misconduct.";

/**
 * Faculty-facing badge for ML authorship hints. Green = Human; neutral = unknown/offline;
 * yellow/amber or red tint = likely AI-generated label from the model.
 */
export default function AIDetectionBadge({ prediction, compact = false }) {
  const raw = (prediction || "").trim();
  const lower = raw.toLowerCase();

  let chip =
    "border border-slate-300 bg-slate-100 text-slate-700";
  if (lower === "human") {
    chip =
      "border border-emerald-400 bg-emerald-50 text-emerald-900";
  } else if (lower.startsWith("unknown")) {
    chip =
      "border border-slate-300 bg-slate-100 text-slate-600";
  } else if (raw) {
    const strongModel = /gemini|codestral|llama|gpt|claude|openai/i.test(raw);
    chip = strongModel
      ? "border border-red-400 bg-red-50 text-red-900"
      : "border border-amber-400 bg-amber-50 text-amber-950";
  }

  const label = raw || "No prediction";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg font-black uppercase tracking-widest text-[10px] ${chip} ${compact ? "px-2 py-0.5" : "px-2.5 py-1"}`}
    >
      <span>AI signal: {label}</span>
      <span
        title={DISCLAIMER}
        className="inline-flex cursor-help opacity-75 hover:opacity-100"
        aria-label={DISCLAIMER}
      >
        <Info size={compact ? 12 : 14} strokeWidth={2.5} />
      </span>
    </div>
  );
}
