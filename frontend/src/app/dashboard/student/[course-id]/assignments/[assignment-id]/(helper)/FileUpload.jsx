"use client";

import React from "react";
import {
  CloudUpload,
  FileCode,
  Trash2,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export default function FileUpload({
  handleUpload,
  file,
  setFile,
  language,
  children,
}) {
  const isJava = language === "java";
  const extension = isJava ? ".java" : ".py";
  const displayLang = isJava ? "Java" : "Python";

  const onFileChange = (e) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(extension)) {
        alert(
          `Invalid file. Please upload a ${displayLang} (${extension}) file.`,
        );
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 py-6">
      <form onSubmit={handleUpload} className="space-y-6">
        {/* 1. Integrated Dropzone Area */}
        <div className="relative">
          <label
            className={`
            flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer
            ${
              file
                ? "bg-secondary/5 border-secondary/40"
                : "bg-slate-50 border-border hover:border-primary/40 hover:bg-white"
            }
          `}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`p-2 rounded-md ${file ? "bg-secondary text-white" : "bg-primary/10 text-primary"}`}
              >
                {file ? <FileCode size={20} /> : <CloudUpload size={20} />}
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-black text-accent uppercase tracking-tight truncate">
                  {file ? file.name : `Select ${displayLang} Source`}
                </p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                  {file
                    ? "File staged for grading"
                    : `Expected format: ${extension}`}
                </p>
              </div>
            </div>

            {!file && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-3 py-1 border border-primary/20 rounded-md">
                Browse
              </span>
            )}

            <input
              type="file"
              accept={extension}
              className="hidden"
              onChange={onFileChange}
            />
          </label>

          {file && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
              }}
              className="absolute -right-2 -top-2 p-1.5 bg-accent text-white rounded-full shadow-md hover:bg-error transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* 2. Action Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={!file}
            className={`
              flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 rounded font-black uppercase text-[10px] tracking-[0.25em] transition-all
              ${
                !file
                  ? "bg-slate-100 text-text-muted cursor-not-allowed border border-border"
                  : "bg-primary text-white hover:bg-accent shadow-lg active:scale-95"
              }
            `}
          >
            {file && <Terminal size={14} className="text-secondary" />}
            {file ? `Run ${displayLang} Evaluator` : "No File Selected"}
          </button>

          {children}
        </div>

        {/* 3. Small Compliance Note */}
        <div className="flex items-center gap-2 opacity-50 px-1">
          <CheckCircle2 size={12} className="text-secondary" />
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
            System will execute against public and hidden test cases.
          </p>
        </div>
      </form>
    </div>
  );
}
