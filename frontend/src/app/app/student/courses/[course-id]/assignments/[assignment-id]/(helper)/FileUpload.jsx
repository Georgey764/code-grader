"use client";

import React from "react";
import { CloudUpload, FileCode, X, CheckCircle2 } from "lucide-react";

export default function FileUpload({ handleUpload, file, setFile, children }) {
  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.preventDefault();
    setFile(null);
  };

  return (
    <section className="bg-surface p-6 sm:p-10 rounded-xl border border-border shadow-subtle transition-all animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-h2 border-none pb-0 text-xl sm:text-2xl uppercase tracking-tighter">
            Submit Your Code
          </h2>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-1">
            Python Source File (.py)
          </p>
        </div>
        <div className="flex items-center">{children}</div>
      </div>

      <form onSubmit={handleUpload} className="space-y-8">
        <div className="relative group">
          <label
            className={`
              flex flex-col items-center justify-center w-full min-h-[200px] 
              border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
              ${
                file
                  ? "border-secondary bg-secondary/5"
                  : "border-border bg-background hover:bg-slate-50 hover:border-secondary/40"
              }
            `}
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              {/* Dynamic Icon State */}
              <div
                className={`mb-4 p-4 rounded-full transition-transform duration-500 ${
                  file
                    ? "bg-secondary/20 text-secondary scale-110"
                    : "bg-primary/5 text-primary group-hover:scale-110"
                }`}
              >
                {file ? <FileCode size={32} /> : <CloudUpload size={32} />}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-black text-accent truncate max-w-[250px] sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> Ready for upload
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-text-muted">
                    <span className="font-black text-primary uppercase tracking-tight">
                      Click to browse
                    </span>
                    <span className="hidden sm:inline"> or drag and drop</span>
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-medium opacity-60">
                    Maximum size: 5MB
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept=".py"
              className="hidden"
              onChange={onFileChange}
            />
          </label>

          {/* Clear Selection Button */}
          {file && (
            <button
              onClick={clearFile}
              className="absolute -top-3 -right-3 p-1.5 bg-accent text-white rounded-full shadow-lg hover:bg-error transition-colors"
              title="Remove file"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file}
          className={`
            cursor-pointer w-full py-4 rounded shadow-lg font-black uppercase text-xs tracking-[0.3em] transition-all
            ${
              !file
                ? "bg-border text-text-muted opacity-50 cursor-not-allowed"
                : "bg-primary text-white hover:bg-accent hover:shadow-xl active:scale-[0.98]"
            }
          `}
        >
          {file ? "Begin Grading Sequence" : "Select a File to Continue"}
        </button>
      </form>
    </section>
  );
}
