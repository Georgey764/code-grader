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
  Terminal,
  Trash,
  X,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/elements";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";

// Use dynamic import with ssr: false
// Source - https://stackoverflow.com/a/78116690
// Posted by Bigboss01, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-18, License - CC BY-SA 4.0

const XTerminal = dynamic(() => import("@/components/ui/elements/XTerminal"), {
  ssr: false,
});

export default function CodeReport({ results, submission }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTest, setOpenTest] = useState(null);
  const [runCount, setRunCount] = useState(0);
  const [isRunningCode, setIsRunningCode] = useState(false);

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

  async function handleRunCode() {
    setIsRunningCode(true);
    setRunCount((cur) => cur + 1);
  }

  return (
    <div className="space-y-6">
      {/* Standard Input */}
      {/* <div className="flex flex-col gap-2.5 group">

        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors">
          <Terminal size={14} className="opacity-60" />
          Standard Input
        </label>

        <textarea
          className="w-full min-h-[40px] p-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none transition-all 
               shadow-inner placeholder:text-slate-300 resize-none
               focus:ring-4 focus:ring-primary/5 focus:border-primary
               hover:border-slate-300"
          placeholder="e.g. 5\n10"
        />
      </div> */}

      {/* Submission File Code View */}
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors mt-8 mb-2">
        <Terminal size={14} className="opacity-60" />
        Submitted File
      </label>
      <div className="space-y-2">
        <CodeBlock
          code={submission?.submitted_file}
          name="main.py"
          handleRunCode={handleRunCode}
          isRunningCode={isRunningCode}
        />
      </div>
      {/* Terminal */}
      <div className=" w-full flex items-center justify-between gap-2 mb-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors ">
          <Terminal size={14} className="opacity-60" />
          Console
        </label>

        <button
          onClick={() => setRunCount(0)}
          className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
        >
          <Trash size={12} /> Clear Console
        </button>
      </div>
      <div className="min-h-[200px] w-full relative">
        <XTerminal
          code={submission?.submitted_file}
          runCount={runCount}
          setIsRunningCode={setIsRunningCode}
        />
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
