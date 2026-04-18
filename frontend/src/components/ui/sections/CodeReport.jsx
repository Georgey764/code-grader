"use client";

import { useEffect, useState } from "react";

import { ChevronDown, Eye, MessageSquare, Scale, Terminal, Trash } from "lucide-react";
import { CodeBlock } from "@/components/ui/elements";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import {
  parseSubmittedPayload,
  orderedSubmissionFilenames,
  playgroundSourceFromPayload,
  runtimeEntryFromTabFilename,
} from "@/utils/submissionPayload";

const XTerminal = dynamic(() => import("@/components/ui/elements/XTerminal"), {
  ssr: false,
});

export default function CodeReport({ submission, assignmentId }) {
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isRunningTestCases, setIsRunningTestCases] = useState(false);
  const [inputFile, setInputFile] = useState(null);
  const [activeFileName, setActiveFileName] = useState(null);
  const { api } = useMetadata();
  const [assignment, setAssignment] = useState(null);
  const [testCases, setTestCases] = useState(null);

  const language = assignment?.language;
  const isPython = language?.toLowerCase() === "python";
  const isFileInput = assignment?.is_file_input;

  const rubricResults = submission?.rubric_results || [];

  useEffect(() => {
    setActiveFileName(null);
  }, [submission?.id]);

  function handleRunCodeForTab(fileName) {
    if (isRunningTestCases || isRunningCode) {
      return;
    }
    setActiveFileName(fileName);
    setIsRunningCode(true);
    setRunCount((cur) => cur + 2);
  }

  function handleRunTestCasesForTab(fileName) {
    if (isRunningCode || isRunningTestCases) {
      return;
    }
    setActiveFileName(fileName);
    setRunCount(-1);
    setIsRunningTestCases(true);
  }

  useEffect(() => {
    const fetchAssignment = async () => {
      const [assignmentResponse, testCasesResponse] = await Promise.all([
        api.get(`assignments/${assignmentId}`),
        api.get(`assignments/${assignmentId}/test-cases`),
      ]);
      setAssignment(assignmentResponse.data);
      setTestCases(testCasesResponse.data);
    };
    fetchAssignment();
  }, [assignmentId, api]);

  if (!assignment) return <LoadingPage />;

  const parsed = parseSubmittedPayload(submission?.submitted_file);
  const submissionFileLabel =
    parsed.mode === "multi" ? "Submitted files" : "Submitted file";
  const codeTabs =
    parsed.mode === "multi"
      ? orderedSubmissionFilenames(
          parsed.files,
          isPython,
          parsed.entry,
        ).map((name) => ({
          name,
          code: parsed.files[name] ?? "",
        }))
      : [
          {
            name: isPython ? "submission.py" : "Submission.java",
            code: parsed.content ?? "",
          },
        ];

  const resolvedActive =
    activeFileName && codeTabs.some((t) => t.name === activeFileName)
      ? activeFileName
      : codeTabs[0]?.name ?? null;

  const activeTabContent =
    codeTabs.find((t) => t.name === resolvedActive)?.code ??
    playgroundSourceFromPayload(parsed, isPython);

  const playgroundCode =
    parsed.mode === "multi" ? activeTabContent : playgroundSourceFromPayload(parsed, isPython);

  const fromTab =
    parsed.mode === "multi" && resolvedActive
      ? runtimeEntryFromTabFilename(resolvedActive, isPython)
      : null;
  const terminalEntry =
    parsed.mode === "multi" ? (fromTab ?? parsed.entry ?? null) : null;

  return (
    <div className="space-y-6">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors mt-8 mb-2">
        <Terminal size={14} className="opacity-60" />
        {submissionFileLabel}
      </label>
      <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest -mt-2 mb-2">
        Click a file to select it — Run and Test Cases use the selected file as the program entry.
      </p>

      <div className="space-y-4">
        {codeTabs.map((tab) => (
          <div
            key={tab.name}
            className={`rounded-lg transition-[box-shadow] ${
              resolvedActive === tab.name
                ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                : ""
            }`}
          >
            <div
              role="presentation"
              onClick={() => setActiveFileName(tab.name)}
              className="cursor-pointer"
            >
              <CodeBlock
                inputFile={inputFile}
                assignmentId={assignmentId}
                setInputFile={setInputFile}
                code={tab.code}
                name={tab.name}
                handleRunCode={() => handleRunCodeForTab(tab.name)}
                isRunningCode={isRunningCode}
                handleRunTestCases={() => handleRunTestCasesForTab(tab.name)}
                isRunningTestCases={isRunningTestCases}
                isFileInput={isFileInput}
                submissionId={submission?.id}
              />
            </div>
          </div>
        ))}
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
          code={playgroundCode}
          terminalFiles={parsed.mode === "multi" ? parsed.files : null}
          entry={terminalEntry}
          runCount={runCount}
          setIsRunningCode={setIsRunningCode}
          isRunningTestCases={isRunningTestCases}
          setIsRunningTestCases={setIsRunningTestCases}
          inputFile={inputFile}
          testCases={testCases}
          isFileInput={isFileInput}
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
              e.stopPropagation();
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
