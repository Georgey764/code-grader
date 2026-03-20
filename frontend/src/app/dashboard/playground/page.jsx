"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp, Terminal, Trash } from "lucide-react";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import EditableCodeBlock from "@/components/ui/elements/EditableCodeBlock";

const XTerminal = dynamic(() => import("@/components/ui/elements/XTerminal"), {
  ssr: false,
});

const DEFAULT_CODE = `# Python playground
print("Hello, World!")
`;

export default function PlaygroundPage() {
  const { api } = useMetadata();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submission_id");

  const [code, setCode] = useState(DEFAULT_CODE);
  const [runCount, setRunCount] = useState(0);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [inputFile, setInputFile] = useState(null);
  const [loading, setLoading] = useState(!!submissionId);
  const [language, setLanguage] = useState("python");
  const [fileName, setFileName] = useState("main.py");
  const [consoleExpanded, setConsoleExpanded] = useState(true);

  useEffect(() => {
    if (!submissionId) return;

    const fetchSubmission = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `assessments/submissions/${submissionId}/`,
        );
        const submittedFile = response.data?.submitted_file;
        if (submittedFile) {
          setCode(submittedFile);
          const isJava =
            submittedFile.includes("public class") ||
            submittedFile.includes("class Main");
          setLanguage(isJava ? "java" : "python");
          setFileName(isJava ? "Main.java" : "main.py");
        }
      } catch (err) {
        console.error("Failed to load submission:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId, api]);

  function handleRunCode() {
    setIsRunningCode(true);
    setRunCount((cur) => cur + 1);
  }

  if (loading) return <LoadingPage />;

  return (
    <div
      className="fixed top-16 md:top-0 left-0 md:left-16 right-0 bottom-0 flex flex-col bg-background overflow-hidden "
      style={{ zIndex: 1 }}
    >
      {/* Editor section - fills remaining space, scrolls internally */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <EditableCodeBlock
          code={code}
          onCodeChange={setCode}
          name={fileName}
          onFileNameChange={(name) => {
            setFileName(name);
            setLanguage(name.endsWith(".java") ? "java" : "python");
          }}
          handleRunCode={handleRunCode}
          isRunningCode={isRunningCode}
          setInputFile={setInputFile}
          className="flex-1 min-h-0"
        />
      </div>

      {/* Console - toggleable, anchored to bottom */}
      <div className="shrink-0 border-t border-accent bg-code-bg">
        <div
          onClick={() => setConsoleExpanded(!consoleExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-code-header hover:bg-accent/80 transition-colors"
        >
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-code-muted group-focus-within:text-primary">
            <Terminal size={14} className="opacity-60" />
            Console
          </div>
          <div className="flex items-center gap-2">
            {consoleExpanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRunCount(0);
                }}
                className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-code-muted hover:text-code-text transition-all bg-accent/80 hover:bg-accent px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
              >
                <Trash size={12} /> Clear
              </button>
            )}
            {consoleExpanded ? (
              <ChevronDown size={16} className="text-code-muted" />
            ) : (
              <ChevronUp size={16} className="text-code-muted" />
            )}
          </div>
        </div>
        {consoleExpanded && (
          <div className="h-[200px] w-full">
            <XTerminal
              language={language}
              code={code}
              runCount={runCount}
              setIsRunningCode={setIsRunningCode}
              inputFile={inputFile}
            />
          </div>
        )}
      </div>
    </div>
  );
}
