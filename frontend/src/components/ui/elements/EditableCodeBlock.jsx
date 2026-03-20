"use client";

import { FileCode, Loader2, Play, Upload } from "lucide-react";
import { useRef } from "react";
import FileUpload from "./(helper)/FileUpload";

export default function EditableCodeBlock({
  code,
  onCodeChange,
  name = "main.py",
  onFileNameChange,
  handleRunCode,
  isRunningCode,
  setLoadedInputFile,
  setFileSystemInputFile,
  className = "",
}) {
  const loadedInputFileInputRef = useRef(null);

  const handleLoadedInputFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = file.name.endsWith(".py") || file.name.endsWith(".java");
    if (!valid) {
      alert("Please upload a .py or .java file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onCodeChange(reader.result);
      onFileNameChange?.(file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleFileSystemInputFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = file.name.endsWith(".txt");
    if (!valid) {
      alert("Please upload a .txt file.");
      return;
    }
    setFileSystemInputFile(file);
    e.target.value = "";
  };

  return (
    <div
      className={`group border border-accent bg-code-bg overflow-hidden font-mono text-[13px] flex flex-col min-h-0 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-code-header backdrop-blur-sm border-b border-accent shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-code-text">
            <FileCode size={12} className="opacity-70" />
            {name}
          </div>
          {/* Loaded Input File Upload Button */}
          <div className="flex items-center gap-2">
            <input
              ref={loadedInputFileInputRef}
              type="file"
              accept=".py,.java"
              className="hidden"
              onChange={handleLoadedInputFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-code-muted hover:text-code-text transition-all bg-accent/80 hover:bg-accent px-2.5 py-1.5 rounded-md"
            >
              <Upload size={12} />
              Load Playground File
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setFileSystemInputFile && (
            <FileUpload setInputFile={setFileSystemInputFile} />
          )}
          {handleRunCode &&
            (!isRunningCode ? (
              <button
                onClick={handleRunCode}
                className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-code-muted hover:text-code-text transition-all bg-accent/80 hover:bg-accent px-2.5 py-1.5 rounded-md"
              >
                <Play size={12} />
                Run
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-code-muted bg-accent/80 px-2.5 py-1.5 rounded-md">
                <Loader2 size={12} className="animate-spin" /> Running...
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <textarea
          value={code ?? ""}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full min-h-0 py-5 px-4 bg-transparent text-code-text font-mono text-[13px] leading-6 focus:outline-none focus:ring-0 border-0 block overflow-y-auto placeholder:text-code-comment"
          style={{ tabSize: 4 }}
          placeholder="# Enter your code here..."
        />
      </div>

      <style jsx global>{`
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
