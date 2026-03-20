"use client";

import {
  Check,
  Copy,
  Eye,
  FileCode,
  Loader2,
  Maximize,
  Minimize,
  Play,
  Terminal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FileUpload from "./(helper)/FileUpload";

export default function CodeBlock({
  code,
  name = "Starter Code",
  handleRunCode,
  isRunningCode,
  handleRunTestCases,
  isRunningTestCases,
  isFileInput = false,
  setInputFile,
  submissionId,
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const lines = (code || "").split("\n");

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    // Applied bg-slate-950 as the main background
    <div className="group  border border-slate-800 bg-slate-950  overflow-hidden font-mono text-[13px]">
      {/* Editor Header - Applied bg-slate-900 and slate borders */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleMinimize}
            className={`relative flex items-center justify-center
                  h-6 w-6 rounded-full bg-slate-800 hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95`}
          >
            <span className="text-black opacity-80 group-hover:opacity-100 text-white">
              {isMinimized ? <Maximize size={12} /> : <Minimize size={12} />}
            </span>
          </button>

          {/* Changed text-zinc-500 to text-slate-500 */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            <FileCode size={12} className="opacity-70" />
            {name}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setInputFile && isFileInput && (
            <FileUpload setInputFile={setInputFile} />
          )}

          <button
            onClick={handleCopy}
            // Changed text-zinc-400 to text-slate-400 and updated hover bg
            className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>

          {handleRunTestCases &&
            (!isRunningTestCases ? (
              <button
                onClick={handleRunTestCases}
                className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md"
              >
                <Play size={12} />
                Test Cases
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md">
                <Loader2 size={12} className="animate-spin" /> Running Test
                Cases...
              </div>
            ))}

          {handleRunCode &&
            (!isRunningCode ? (
              <button
                onClick={handleRunCode}
                className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md"
              >
                <Play size={12} />
                Run
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md">
                <Loader2 size={12} className="animate-spin" /> Running...
              </div>
            ))}

          {submissionId && (
            <button
              onClick={() =>
                router.push(
                  `/dashboard/playground?submission_id=${submissionId}`,
                )
              }
              className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md"
            >
              <Terminal size={12} /> Open in Playground
            </button>
          )}
        </div>
      </div>

      {/* Code Area */}
      {!isMinimized && (
        <div className="relative overflow-x-auto scrollbar-hide">
          {/* Changed main text color to text-slate-200 for good contrast */}
          <pre className="py-5 text-white min-w-full">
            {lines.map((line, i) => (
              // Changed line hover highlight to a subtle slate-900
              <div
                key={i}
                className="flex px-4 hover:bg-slate-900 transition-colors leading-6"
              >
                {/* Line Numbers - Changed to text-slate-600 */}
                <span className="w-10 shrink-0 text-slate-600 text-left select-none tabular-nums opacity-80">
                  {i + 1}
                </span>

                {/* Actual Code Text - whitespace-pre handles indents */}
                <span className="ml-4 whitespace-pre">{line || " "}</span>
              </div>
            ))}
          </pre>
        </div>
      )}

      <style jsx global>{`
        /* Keep scrollbars hidden as requested previously */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
