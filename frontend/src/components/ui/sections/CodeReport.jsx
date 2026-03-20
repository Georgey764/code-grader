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
  Eye,
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
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";

// Use dynamic import with ssr: false
// Source - https://stackoverflow.com/a/78116690
// Posted by Bigboss01, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-18, License - CC BY-SA 4.0

const XTerminal = dynamic(() => import("@/components/ui/elements/XTerminal"), {
  ssr: false,
});

export default function CodeReport({ results = [], submission, assignmentId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);
  const [openTest, setOpenTest] = useState(null);
  const [runCount, setRunCount] = useState(0);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [inputFile, setInputFile] = useState(null);
  const { api } = useMetadata();
  const [assignment, setAssignment] = useState(null);
  const language = assignment?.language;
  const isPython = language?.toLowerCase() === "python";
  const isFileInput = assignment?.is_file_input;

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

  useEffect(() => {
    const fetchAssignment = async () => {
      const response = await api.get(`assignments/${assignmentId}`);
      setAssignment(response.data);
      console.log(response.data);
    };
    fetchAssignment();
  }, [assignmentId, api]);

  if (!assignment) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Detailed Automated Accordion */}
      <AutomatedTestResultAccordion
        assignmentId={assignmentId}
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

      {/* Submission File Code View */}
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors mt-8 mb-2">
        <Terminal size={14} className="opacity-60" />
        Submitted File
      </label>

      <div className="space-y-2">
        <CodeBlock
          setInputFile={setInputFile}
          code={submission?.submitted_file}
          name={isPython ? "main.py" : "Main.java"}
          handleRunCode={handleRunCode}
          isRunningCode={isRunningCode}
          isFileInput={isFileInput}
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
          language={language}
          code={submission?.submitted_file}
          runCount={runCount}
          setIsRunningCode={setIsRunningCode}
          inputFile={inputFile}
        />
      </div>

      <RubricResultAccordion
        submission={submission}
        rubricResults={rubricResults}
        isExpanded={isRubricExpanded}
        setIsExpanded={setIsRubricExpanded}
        assignmentId={assignmentId}
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
  assignmentId,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTest, setOpenTest] = useState(null);
  const router = useRouter();

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden ">
      {/* --- MASTER TOGGLE HEADER --- */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-white border-b border-slate-200/60 hover:bg-slate-50/50 transition-all cursor-pointer group select-none"
      >
        {/* --- LEFT: Diagnostic Identity --- */}
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl transition-colors ${passedCount === visibleTests.length ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}
          >
            <Layout size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Automated Test Cases Run Results
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {/* Status Dot for Glanceability */}
              <div
                className={`w-1.5 h-1.5 rounded-full ${passedCount === visibleTests.length ? "bg-green-500" : "bg-amber-500 animate-pulse"}`}
              />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {passedCount} / {visibleTests?.length || 0} Test Cases Passed
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT: Actions & Navigation --- */}
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents the accordion from toggling when clicking the button
              router.push(`../assignments/${assignmentId}/test-cases`);
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-md active:scale-95"
          >
            <Eye size={14} />
            Test Cases
          </button>

          <div
            className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
          >
            <ChevronDown
              size={20}
              className={`${isExpanded ? "text-primary" : "text-slate-300"}`}
            />
          </div>
        </div>
      </div>

      {/* --- ACCORDION CONTENT --- */}
      {isExpanded && (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* --- TEST CASE LIST --- */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-zinc-200" /> Test Cases
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

function RubricResultAccordion({
  rubricResults,
  isExpanded,
  setIsExpanded,
  submission,
  assignmentId,
}) {
  const router = useRouter();
  const totalEarned = rubricResults.reduce(
    (acc, curr) => acc + parseFloat(curr.points || 0),
    0,
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-white border-b border-slate-200/60 hover:bg-slate-50/50 transition-all cursor-pointer group select-none"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:text-secondary transition-colors">
            <Scale size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Instructor Manual Review
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {totalEarned.toFixed(1)} Total Points Awarded
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevents the accordion from toggling when clicking the button
              router.push(`../assignments/${assignmentId}/rubrics`);
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-md active:scale-95"
          >
            <Eye size={14} />
            Rubrics
          </button>
          <div
            className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
          >
            <ChevronDown size={20} className="text-slate-300" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {rubricResults.length === 0 ? (
            <p className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              Evaluation Pending
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rubricResults.map((res, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Criterion
                      </p>
                      <h4 className="text-sm font-black text-slate-800 leading-none">
                        {res.criteria_name || "Grading Factor"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-secondary tracking-tighter">
                        {parseFloat(res.points).toFixed(1)}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                        Points
                      </p>
                    </div>
                  </div>

                  {res.optional_feedback && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-3">
                      <MessageSquare
                        size={14}
                        className="text-slate-300 shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-slate-500 italic leading-relaxed">
                        &quot;{res.optional_feedback}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
