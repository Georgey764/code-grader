"use client";

import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  Code2,
  Copy,
  CornerDownRight,
  Eye,
  Layout,
  MessageSquare,
  Scale,
  Terminal,
  Trash,
  X,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/elements";
import dynamic from "next/dynamic";
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

function formatSubmissionDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function computeLineMatches(codeA, codeB) {
  const linesA = (codeA || "").split("\n");
  const setB = new Set(
    (codeB || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 15),
  );
  return linesA.map((line) => ({
    text: line,
    isMatch: line.trim().length > 15 && setB.has(line.trim()),
  }));
}

export function PlagiarismModal({ submission, matches, onClose, api }) {
  const { user } = useMetadata();
  const [selected, setSelected] = useState(null);
  const [matchedSub, setMatchedSub] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  if (user?.role !== "FA") {
    return null;
  }

  const handleSelect = async (match) => {
    if (selected?.matched_submission_id === match.matched_submission_id) return;
    setSelected(match);
    setLoadingMatch(true);
    try {
      const res = await api.get(
        `assessments/submissions/${match.matched_submission_id}/`,
      );
      setMatchedSub(res.data);
    } catch (err) {
      console.error("Failed to fetch matched submission", err);
    } finally {
      setLoadingMatch(false);
    }
  };

  const sortedMatches = [...matches].sort(
    (a, b) => b.similarity_score - a.similarity_score,
  );

  const currentLines = selected
    ? computeLineMatches(submission.submitted_file, matchedSub?.submitted_file)
    : [];
  const matchedLines = selected
    ? computeLineMatches(matchedSub?.submitted_file, submission.submitted_file)
    : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col overflow-hidden"
        style={{ height: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-black text-accent text-sm uppercase tracking-widest">
                Plagiarism Report
              </h2>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide mt-0.5">
                {matches.length} similar submission
                {matches.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-text-muted hover:text-accent"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50">
            <p className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted border-b border-slate-200">
              Violations
            </p>
            <div className="overflow-y-auto flex-1">
              {sortedMatches.map((m) => {
                const pct = Math.round(m.similarity_score * 100);
                const isHigh = m.similarity_score >= 0.6;
                const isActive =
                  selected?.matched_submission_id === m.matched_submission_id;
                return (
                  <button
                    type="button"
                    key={m.matched_submission_id}
                    onClick={() => handleSelect(m)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-200 transition-colors ${
                      isActive
                        ? "bg-white border-l-2 border-l-red-500"
                        : "hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-accent truncate">
                      {m.student_name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                      <Calendar size={10} className="shrink-0 text-slate-400" />
                      {formatSubmissionDate(m.matched_submission_created_at)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                          isHigh
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {pct}% similar
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Copy size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-text-muted">
                    Select a student from the list to compare code
                  </p>
                </div>
              </div>
            ) : loadingMatch ? (
              <div className="flex-1 flex items-center justify-center">
                <CircleDashed size={24} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                      This Submission
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      {formatSubmissionDate(submission?.created_at)}
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-950">
                    <table className="w-full text-xs font-mono">
                      <tbody>
                        {currentLines.map((line, i) => (
                          <tr
                            key={i}
                            className={line.isMatch ? "bg-amber-500/20" : ""}
                          >
                            <td className="select-none px-3 py-0 text-slate-600 text-right w-10 border-r border-slate-800 text-[10px]">
                              {i + 1}
                            </td>
                            <td className="px-4 py-0 text-slate-200 whitespace-pre leading-5">
                              {line.text || " "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                      {selected.student_name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      {formatSubmissionDate(matchedSub?.created_at)}
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-950">
                    <table className="w-full text-xs font-mono">
                      <tbody>
                        {matchedLines.map((line, i) => (
                          <tr
                            key={i}
                            className={line.isMatch ? "bg-amber-500/20" : ""}
                          >
                            <td className="select-none px-3 py-0 text-slate-600 text-right w-10 border-r border-slate-800 text-[10px]">
                              {i + 1}
                            </td>
                            <td className="px-4 py-0 text-slate-200 whitespace-pre leading-5">
                              {line.text || " "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selected && !loadingMatch && (
          <div className="px-6 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/60" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                Matching lines
              </span>
            </div>
            <span className="text-[10px] text-text-muted">
              Highlighted lines appear in both submissions
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CodeReport({ results = [], submission, assignmentId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRubricExpanded, setIsRubricExpanded] = useState(false);
  const [openTest, setOpenTest] = useState(null);
  const [runCount, setRunCount] = useState(0);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isRunningTestCases, setIsRunningTestCases] = useState(false);
  const [inputFile, setInputFile] = useState(null);
  const { api, user } = useMetadata();
  const [assignment, setAssignment] = useState(null);
  const [testCases, setTestCases] = useState(null);
  const [rubricCriteria, setRubricCriteria] = useState([]);
  const [plagiarismOpen, setPlagiarismOpen] = useState(false);

  const isInstructor = user?.role === "FA";
  const plagiarismMatches = submission?.plagiarism_matches;
  const showPlagiarismStrip = isInstructor && Array.isArray(plagiarismMatches);

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

  const visibleTests = results?.filter((t) =>
    user.role.toLowerCase() == "st" ? !t?.test_case?.is_hidden : true,
  );
  const passedCount = visibleTests.filter((t) => t.is_success).length;
  const rubricResults = submission?.rubric_results || [];

  function handleRunCode() {
    if (isRunningTestCases || isRunningCode) {
      return;
    }
    setIsRunningCode(true);
    setRunCount((cur) => cur + 2);
  }

  function handleRunTestCases() {
    if (isRunningCode || isRunningTestCases) {
      return;
    }
    setRunCount(-1);
    setIsRunningTestCases(true);
  }

  useEffect(() => {
    const fetchAssignment = async () => {
      const [assignmentResponse, testCasesResponse, rubricCriteriaResponse] =
        await Promise.all([
          api.get(`assignments/${assignmentId}`),
          api.get(`assignments/${assignmentId}/test-cases`),
          api.get(`assignments/${assignmentId}/rubric-criteria/`),
        ]);
      setAssignment(assignmentResponse.data);
      setTestCases(testCasesResponse.data);
      setRubricCriteria(
        Array.isArray(rubricCriteriaResponse.data)
          ? rubricCriteriaResponse.data
          : [],
      );
    };
    fetchAssignment();
  }, [assignmentId, api]);

  if (!assignment) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <RubricCriteriaListAccordion
        assignment={assignment}
        assignmentId={assignmentId}
        rubricCriteria={rubricCriteria}
        rubricResults={rubricResults}
      />

      {plagiarismOpen &&
        showPlagiarismStrip &&
        plagiarismMatches.length > 0 && (
          <PlagiarismModal
            submission={submission}
            matches={plagiarismMatches}
            onClose={() => setPlagiarismOpen(false)}
            api={api}
          />
        )}

      {/* Submission File Code View */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors">
          <Terminal size={14} className="opacity-60" />
          Submitted File
        </label>
        {showPlagiarismStrip &&
          (plagiarismMatches.length > 0 ? (
            <button
              type="button"
              onClick={() => setPlagiarismOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100/80 transition-colors text-[10px] font-black uppercase tracking-widest shrink-0"
            >
              <AlertTriangle size={14} className="shrink-0" />
              Plagiarism report
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700 shrink-0">
              <CheckCircle2 size={10} /> Plagiarism clean
            </span>
          ))}
      </div>

      <div className="space-y-2">
        <CodeBlock
          inputFile={inputFile}
          assignmentId={assignmentId}
          setInputFile={setInputFile}
          code={submission?.submitted_file}
          name={isPython ? "main.py" : "Main.java"}
          handleRunCode={handleRunCode}
          isRunningCode={isRunningCode}
          handleRunTestCases={handleRunTestCases}
          isRunningTestCases={isRunningTestCases}
          isFileInput={isFileInput}
          submissionId={submission?.id}
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
          isRunningTestCases={isRunningTestCases}
          setIsRunningTestCases={setIsRunningTestCases}
          inputFile={inputFile}
          testCases={testCases}
          isFileInput={isFileInput}
        />
      </div>

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

      <CrossClassIssueSection
        crossClassIssues={submission?.cross_class_issues}
      />

      {/* <RubricResultAccordion
        submission={submission}
        rubricResults={rubricResults}
        isExpanded={isRubricExpanded}
        setIsExpanded={setIsRubricExpanded}
        assignmentId={assignmentId}
      /> */}
    </div>
  );
}

/** * UI COMPONENTS */

function RubricCriteriaListAccordion({
  assignment,
  assignmentId,
  rubricCriteria,
  rubricResults,
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const weighted = assignment?.is_weighted;
  const resultByCriteriaId = Object.fromEntries(
    (rubricResults || []).map((r) => [r.rubric_criteria, r]),
  );
  const count = rubricCriteria?.length ?? 0;

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-white border-b border-slate-200/60 hover:bg-slate-50/50 transition-all cursor-pointer group select-none"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-slate-100 text-secondary rounded-xl shrink-0">
            <Scale size={20} />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Rubrics
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] truncate">
                {count === 0
                  ? "No criteria defined"
                  : `${count} ${count === 1 ? "criterion" : "criteria"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <button
            type="button"
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
            <ChevronDown
              size={20}
              className={isExpanded ? "text-primary" : "text-slate-300"}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {count === 0 ? (
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic py-6">
              No rubric criteria for this assignment yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {rubricCriteria.map((c) => {
                const res = resultByCriteriaId[c.id];
                const earned =
                  res?.points != null ? parseFloat(res.points) : null;
                return (
                  <li
                    key={c.id}
                    className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Criterion
                      </p>
                      <p className="text-sm font-black text-slate-800 leading-snug">
                        {c.name}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight pt-1">
                        <span>
                          Max {parseFloat(c.max_points).toFixed(1)} pts
                        </span>
                        {weighted && c.weight != null && (
                          <span>Weight {parseFloat(c.weight).toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        This submission
                      </p>
                      {earned != null ? (
                        <p className="text-lg font-black text-secondary tabular-nums">
                          {earned.toFixed(1)}
                          <span className="text-xs font-bold text-slate-400">
                            {" "}
                            / {parseFloat(c.max_points).toFixed(1)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-400 italic pt-0.5">
                          Not graded
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AutomatedTestResultAccordion({
  passedCount,
  visibleTests,
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
              Initial Automated Results
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
              {visibleTests?.map((test, i) => (
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

function CrossClassIssueSection({ crossClassIssues }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openIssue, setOpenIssue] = useState(null);
  const [openDuplicate, setOpenDuplicate] = useState(null);

  const notChecked =
    crossClassIssues === null || crossClassIssues === undefined;
  const hasIssues = !notChecked && crossClassIssues?.has_issues === true;
  const issues = crossClassIssues?.issues || [];

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-white border-b border-slate-200/60 hover:bg-slate-50/50 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl transition-colors ${
              notChecked
                ? "bg-slate-100 text-slate-400"
                : hasIssues
                  ? "bg-amber-50 text-amber-600"
                  : "bg-green-50 text-green-600"
            }`}
          >
            <Code2 size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Cross-Class Analysis
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {notChecked ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    Pending
                  </p>
                </>
              ) : hasIssues ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">
                    {issues.length} Class{" "}
                    {issues.length === 1 ? "Pair" : "Pairs"} with Duplicate
                    Methods
                  </p>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    No Duplicate Classes Detected
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
        >
          <ChevronDown
            size={20}
            className={isExpanded ? "text-primary" : "text-slate-300"}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {notChecked ? (
            <p className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              Analysis Pending
            </p>
          ) : !hasIssues ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="p-3 bg-green-50 rounded-full text-green-500">
                <Check size={20} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                No duplicate class functionality detected
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => setOpenIssue(openIssue === i ? null : i)}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={15}
                        className="text-amber-500 shrink-0"
                      />
                      <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-tight">
                        {issue.class_a} &amp; {issue.class_b}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-full tracking-wider">
                        {issue.duplicate_methods.length} duplicate{" "}
                        {issue.duplicate_methods.length === 1
                          ? "method"
                          : "methods"}
                      </span>
                    </div>
                    {openIssue === i ? (
                      <ChevronUp size={16} className="text-zinc-400" />
                    ) : (
                      <ChevronDown size={16} className="text-zinc-400" />
                    )}
                  </button>

                  {openIssue === i && (
                    <div className="p-4 bg-zinc-50/50 border-t border-zinc-200 space-y-3 animate-in slide-in-from-top-1">
                      {issue.duplicate_methods.map((dup, j) => (
                        <div
                          key={j}
                          className="border border-zinc-100 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setOpenDuplicate(
                                openDuplicate === `${i}-${j}`
                                  ? null
                                  : `${i}-${j}`,
                              )
                            }
                            className="w-full px-4 py-2.5 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono font-bold text-zinc-600">
                                {issue.class_a}.
                                <span className="text-amber-600">
                                  {dup.method_a}
                                </span>
                                {dup.method_a !== dup.method_b && (
                                  <>
                                    {" "}
                                    / {issue.class_b}.
                                    <span className="text-amber-600">
                                      {dup.method_b}
                                    </span>
                                  </>
                                )}
                              </span>
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded tracking-wider">
                                {Math.round(dup.similarity * 100)}% similar
                              </span>
                            </div>
                            {openDuplicate === `${i}-${j}` ? (
                              <ChevronUp size={14} className="text-zinc-400" />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-zinc-400"
                              />
                            )}
                          </button>

                          {openDuplicate === `${i}-${j}` && (
                            <div className="grid grid-cols-2 gap-0 border-t border-zinc-100">
                              <div className="border-r border-zinc-100">
                                <div className="px-3 py-1.5 bg-slate-100 border-b border-zinc-100">
                                  <span className="text-[9px] font-black uppercase text-zinc-400">
                                    {issue.class_a}.{dup.method_a}
                                  </span>
                                </div>
                                <pre className="p-3 bg-slate-900 text-slate-300 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap max-h-60">
                                  {dup.snippet_a || "—"}
                                </pre>
                              </div>
                              <div>
                                <div className="px-3 py-1.5 bg-slate-100 border-b border-zinc-100">
                                  <span className="text-[9px] font-black uppercase text-zinc-400">
                                    {issue.class_b}.{dup.method_b}
                                  </span>
                                </div>
                                <pre className="p-3 bg-slate-900 text-slate-300 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap max-h-60">
                                  {dup.snippet_b || "—"}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
