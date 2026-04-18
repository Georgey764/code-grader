"use client";

import React, { useRef } from "react";
import {
  CloudUpload,
  FileCode,
  CheckCircle2,
  Terminal,
  X,
} from "lucide-react";

export default function FileUpload({
  handleUpload,
  files,
  setFiles,
  language,
  children,
}) {
  const inputRef = useRef(null);
  const isJava = language === "java";
  const extension = isJava ? ".java" : ".py";
  const displayLang = isJava ? "Java" : "Python";
  const list = Array.isArray(files) ? files : [];

  const onFileChange = (e) => {
    const picked = [...(e.target.files || [])];
    if (!picked.length) return;

    setFiles((prev) => {
      const prevArr = Array.isArray(prev) ? prev : [];
      const map = new Map(prevArr.map((f) => [f.name, f]));
      for (const f of picked) {
        if (!f.name.endsWith(extension)) {
          alert(
            `Skipped ${f.name}: not a ${displayLang} (${extension}) file.`,
          );
          continue;
        }
        map.set(f.name, f);
      }
      return [...map.values()];
    });
    e.target.value = "";
  };

  const removeFile = (name) => {
    setFiles((prev) =>
      (Array.isArray(prev) ? prev : []).filter((f) => f.name !== name),
    );
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    if (!list.length) return;
    handleUpload(e);
  };

  return (
    <div className="animate-in fade-in duration-500 py-6">
      <form onSubmit={onSubmitForm} className="space-y-6">
        <div className="relative space-y-3">
          <label
            className={`
            flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer
            ${
              list.length
                ? "bg-secondary/5 border-secondary/40"
                : "bg-slate-50 border-border hover:border-primary/40 hover:bg-white"
            }
          `}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`p-2 rounded-md ${list.length ? "bg-secondary text-white" : "bg-primary/10 text-primary"}`}
              >
                {list.length ? <FileCode size={20} /> : <CloudUpload size={20} />}
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-black text-accent uppercase tracking-tight truncate">
                  {list.length
                    ? `${list.length} file${list.length === 1 ? "" : "s"} selected`
                    : `Select ${displayLang} source`}
                </p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                  One or more {extension} files · multi-file projects bundle together
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-3 py-1 border border-primary/20 rounded-md shrink-0">
              Browse
            </span>

            <input
              ref={inputRef}
              type="file"
              accept={extension}
              multiple
              className="hidden"
              onChange={onFileChange}
            />
          </label>

          {list.length > 0 && (
            <ul className="rounded-lg border border-border bg-slate-50/80 divide-y divide-border/60 max-h-48 overflow-y-auto">
              {list.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                >
                  <span className="font-mono font-medium text-accent truncate">
                    {f.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.name)}
                    className="p-1.5 text-text-muted hover:text-error rounded-md hover:bg-white shrink-0"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={!list.length}
            className={`
              flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 rounded font-black uppercase text-[10px] tracking-[0.25em] transition-all
              ${
                !list.length
                  ? "bg-slate-100 text-text-muted cursor-not-allowed border border-border"
                  : "bg-primary text-white hover:bg-accent shadow-lg active:scale-95"
              }
            `}
          >
            {!!list.length && <Terminal size={14} className="text-secondary" />}
            {!list.length
              ? "No files selected"
              : `Run ${displayLang} evaluator`}
          </button>

          {children}
        </div>

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
