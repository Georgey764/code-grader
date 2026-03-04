"use client";

import React from "react";
import { Terminal, Check, X, Trophy, Code } from "lucide-react";

export default function ResultsView({ results = [], children = null }) {
  // Logic to calculate score from public tests
  const score = results.reduce(
    (acc, test) =>
      !test?.test_case?.is_hidden && test?.is_success
        ? acc + (test?.test_case?.points || 0)
        : acc,
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Minimal Score Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-accent">
              Results
            </h2>
            <p className="text-[10px] text-text-muted font-bold uppercase">
              Public Test Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-0.5">
              Points
            </p>
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-secondary" />
              <span className="text-2xl font-black text-accent leading-none">
                {score}
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>

      {/* 2. Simplified Test List */}
      <div className="space-y-3">
        {results.map((test, index) => {
          if (test?.test_case?.is_hidden) return null;
          const passed = test?.is_success;

          return (
            <div
              key={index}
              className="bg-surface rounded-lg border border-border group transition-all overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-full ${passed ? "bg-green-500 text-white" : "bg-error text-white"}`}
                    >
                      {passed ? (
                        <Check size={14} strokeWidth={4} />
                      ) : (
                        <X size={14} strokeWidth={4} />
                      )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight text-accent">
                      Case {index + 1}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      passed
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-error"
                    }`}
                  >
                    {passed ? "Passed" : "Failed"}
                  </span>
                </div>

                {/* Simplified Logs */}
                {(test?.stdout || test?.stderr) && (
                  <div className="bg-slate-950 p-4 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto border border-white/5">
                    {test?.stdout && (
                      <div className="text-slate-300">
                        <span className="text-green-500 font-bold mr-2">
                          OUT:
                        </span>
                        {test.stdout}
                      </div>
                    )}
                    {test?.stderr && (
                      <div className="text-red-400 mt-1">
                        <span className="font-bold mr-2">ERR:</span>
                        {test.stderr}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Subtle Footer */}
      <div className="text-center">
        <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-bold opacity-60">
          Evaluated in Secure Sandbox • Final Grades handled by Instructor
        </p>
      </div>
    </div>
  );
}
