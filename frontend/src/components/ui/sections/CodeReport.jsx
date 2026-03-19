"use client";

import { useEffect, useState } from "react";

import {
  Award,
  Beaker,
  Check,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  ExternalLink,
  FileSearch,
  Layout,
  MessageSquare,
  Pencil,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/elements";

export default function CodeReport({ results, submission }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTest, setOpenTest] = useState(null);

  const levelMap = {
    1: { label: "Beginning", color: "text-red-600" },
    2: { label: "Developing", color: "text-orange-600" },
    3: { label: "Proficient", color: "text-amber-600" },
    4: { label: "Accomplished", color: "text-blue-600" },
    5: { label: "Exceptional", color: "text-green-600" },
  };

  const visibleTests = results.filter((t) => !t?.test_case?.is_hidden);
  const passedCount = visibleTests.filter((t) => t.is_success).length;
  const rubricResults = submission?.rubric_results || [];

  return (
    <div className="space-y-6">
      STANDARD INPUT:
      <textarea className="w-full min-h-[80px] p-4 bg-background border border-border rounded font-mono text-sm focus:ring-1 focus:ring-secondary outline-none" />
      {/* Submission File Code View */}
      <div className="space-y-2">
        <CodeBlock code={submission?.submitted_file} name="Submission File" />
      </div>
      {/* Detailed Automated Accordion */}
      <AutomatedTestResultAccordion
        passedCount={passedCount}
        visibleTests={visibleTests}
        submission={submission}
        rubricResults={rubricResults}
        levelMap={levelMap}
        results={results}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        openTest={openTest}
        setOpenTest={setOpenTest}
      />
    </div>
  );
}

/** * UI COMPONENTS */

function AutomatedTestResultAccordion({
  passedCount,
  visibleTests,
  submission,
  rubricResults,
  levelMap,
  results,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTest, setOpenTest] = useState(null);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden ">
      {/* --- MASTER TOGGLE HEADER --- */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-white border-b border-zinc-200 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800">
              Automated Test Run Report
            </h3>
            <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-tighter">
              {passedCount}/{visibleTests?.length || 0} Tests Passed
            </p>
          </div>
        </div>
        <div
          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        >
          <ChevronDown size={20} className="text-zinc-400" />
        </div>
      </button>

      {/* --- ACCORDION CONTENT --- */}
      {isExpanded && (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* --- INSTRUCTOR FEEDBACK --- */}
          {rubricResults?.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-zinc-200" /> Criteria Review
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rubricResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white border border-zinc-200 rounded-xl flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        {res.criteria_name}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase ${levelMap?.[res.points]?.color}`}
                      >
                        {levelMap?.[res.points]?.label}
                      </span>
                    </div>
                    {res.optional_feedback && (
                      <p className="text-xs text-zinc-500 italic flex gap-2 pt-2 border-t border-zinc-50">
                        <MessageSquare
                          size={12}
                          className="shrink-0 mt-0.5 text-zinc-300"
                        />
                        &quot;{res.optional_feedback}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TEST CASE LIST --- */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-zinc-200" /> Test Diagnostics
            </h4>
            <div className="space-y-2">
              {results?.map((test, i) => (
                <div
                  key={i}
                  className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => setOpenTest(openTest === i ? null : i)}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {test.is_success ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <X size={16} className="text-red-600" />
                      )}
                      <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-tight">
                        Test Case {i + 1}
                      </span>
                    </div>
                    {openTest === i ? (
                      <ChevronUp size={16} className="text-zinc-400" />
                    ) : (
                      <ChevronDown size={16} className="text-zinc-400" />
                    )}
                  </button>

                  {openTest === i && (
                    <div className="p-4 bg-zinc-50/50 border-t border-zinc-200 space-y-4 animate-in slide-in-from-top-1">
                      <div className="grid grid-cols-2 gap-4">
                        <DataBit
                          label="Input"
                          value={test.test_case?.text_input}
                        />
                        <DataBit
                          label="Expected"
                          value={test.test_case?.expected_output}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-zinc-400">
                          Execution Logs
                        </span>
                        <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto border border-slate-800">
                          {test.stdout || "No output."}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataBit({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-[9px] font-black uppercase text-text-muted flex items-center gap-1">
        <CornerDownRight size={10} /> {label}
      </span>
      <div className="whitespace-pre-wrap p-2 bg-white border border-border rounded text-[10px] font-mono truncate">
        {value || "None"}
      </div>
    </div>
  );
}
