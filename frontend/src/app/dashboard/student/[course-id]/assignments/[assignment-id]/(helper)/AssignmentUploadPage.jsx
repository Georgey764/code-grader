"use client";

import React, { useState, useEffect } from "react";
import { useMetadata } from "@/context";
import {
  List,
  PlusIcon,
  History,
  CloudUpload,
  RotateCcw,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  Type,
  FileUp,
  Terminal,
} from "lucide-react";
import FileUpload from "./FileUpload";
import PollingView from "./PollingView";
import AssignmentDetails from "./AssignmentDetails";
import SubmissionList from "./SubmissionList";
import { EditableCodeBlock } from "@/components/ui/elements";
import { CodeReport, LoadingPage } from "@/components/ui/sections";

function normalizeCwid(c) {
  if (c == null || c === "") return "";
  return String(c).trim().toLowerCase();
}

function resolveStudentGroupMeta(groupsList, userCwid) {
  const cwidNorm = normalizeCwid(userCwid);
  if (!cwidNorm) return { id: null, isLeader: false, name: "" };
  const list = Array.isArray(groupsList) ? groupsList : [];
  for (const g of list) {
    for (const m of g.group_memberships || []) {
      const u = m.roster_student?.student_profile?.user;
      if (u?.cwid && normalizeCwid(u.cwid) === cwidNorm) {
        return {
          id: g.id,
          isLeader: !!m.is_leader,
          name: g.name || "",
        };
      }
    }
  }
  return { id: null, isLeader: false, name: "" };
}

export default function AssignmentUploadPage({ courseId, assignmentId }) {
  const { api, user } = useMetadata();

  // Mode & Data State
  const [submissionMode, setSubmissionMode] = useState("file"); // 'file' or 'editor'
  const [files, setFiles] = useState([]);
  const [editorCode, setEditorCode] = useState("");
  const [editorFileName, setEditorFileName] = useState("main.py");

  // Workflow State
  const [status, setStatus] = useState("list");
  const [results, setResults] = useState([]);
  const [roster, setRoster] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [assignmentData, setAssignmentData] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groupMeta, setGroupMeta] = useState({
    id: null,
    isLeader: false,
    name: "",
  });

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [assignmentResponse, submissionResponse, rosterResponse] =
          await Promise.all([
            api.get(`assignments/${assignmentId}/`),
            api.get(`assessments/submissions/?assignment_id=${assignmentId}`),
            api.get(
              `courses/${courseId}/rosters/?assignment_id=${assignmentId}`,
            ),
          ]);

        const data = assignmentResponse?.data;
        setRoster(rosterResponse?.data?.at(0));
        const subData = submissionResponse?.data;
        const subList = Array.isArray(subData)
          ? subData
          : (subData?.results ?? []);
        setSubmissions([...subList].reverse());
        setAssignmentData(data);

        if (data?.is_grouped) {
          const gr = await api.get(`assignments/${assignmentId}/groups/`);
          const raw = Array.isArray(gr.data)
            ? gr.data
            : (gr.data?.results ?? []);
          setGroupMeta(resolveStudentGroupMeta(raw, user?.cwid));
        } else {
          setGroupMeta({ id: null, isLeader: false, name: "" });
        }

        // Initialize Editor filename based on assignment language
        const ext = data?.language?.toLowerCase() === "java" ? "java" : "py";
        setEditorFileName(`main.${ext}`);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageData();
  }, [api, assignmentId, courseId, user?.cwid]);

  // Sync file content to editor if user switches modes after selecting one file
  useEffect(() => {
    if (
      files.length === 1 &&
      submissionMode === "editor" &&
      !editorCode
    ) {
      files[0].text().then((text) => setEditorCode(text));
    }
  }, [files, submissionMode, editorCode]);

  if (isLoading) return <LoadingPage />;

  const handleUpload = async (e) => {
    e?.preventDefault();

    if (assignmentData?.is_grouped) {
      if (!groupMeta.id) {
        alert(
          "You are not assigned to a group for this assignment. Contact your instructor.",
        );
        return;
      }
      if (!groupMeta.isLeader) {
        alert("Only your group leader can submit for this assignment.");
        return;
      }
    }

    let contentToSubmit = "";
    if (submissionMode === "file") {
      if (!files.length) return;
      if (files.length === 1) {
        contentToSubmit = await files[0].text();
      } else {
        const bundle = { v: 1, files: {} };
        const isJava = assignmentData?.language?.toLowerCase() === "java";
        for (const f of files) {
          let key = f.name;
          if (isJava && key.toLowerCase() === "main.java") key = "Main.java";
          if (!isJava && key.toLowerCase() === "main.py") key = "main.py";
          bundle.files[key] = await f.text();
        }
        contentToSubmit = JSON.stringify(bundle);
      }
    } else {
      if (!editorCode.trim()) return alert("Editor is empty.");
      contentToSubmit = editorCode;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("assignment", assignmentId);
    formData.append("roster", roster?.id);
    if (assignmentData?.is_grouped && groupMeta.id) {
      formData.append("group", groupMeta.id);
    }
    formData.append("submitted_file", contentToSubmit);

    try {
      const response = await api.post("assessments/submissions/", formData);
      const sub = response.data;
      setActiveSubmission(sub);
      setResults(sub?.test_results || []);
      setStatus("completed");
      try {
        const res = await api.get(
          `assessments/submissions/?assignment_id=${assignmentId}`,
        );
        const r = res.data;
        const list = Array.isArray(r) ? r : (r?.results ?? []);
        setSubmissions([...list].reverse());
      } catch (_) {
        /* list refresh is best-effort */
      }
    } catch (err) {
      setStatus("upload");
      const detail = err?.response?.data?.detail;
      const msg = err?.response?.data?.error;
      alert(
        `Submit failed: ${detail || msg || err?.message || "Ensure your files meet requirements."}`,
      );
    }
  };

  const resetWorkflow = (targetStatus = "list") => {
    setStatus(targetStatus);
    setFiles([]);
    setEditorCode("");
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mx-auto px-3 sm:px-4 pb-12 sm:pb-20 space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full">
      <AssignmentDetails
        assignmentData={assignmentData}
        courseId={courseId}
        assignmentId={assignmentId}
      />

      <div className="w-full bg-surface rounded-xl border border-border shadow-subtle overflow-hidden relative">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-background/50">
          <StepTab
            active={status === "list"}
            label="History"
            icon={<History size={16} />}
          />
          <StepTab
            active={status === "upload" || status === "uploading"}
            label="Submit"
            icon={<CloudUpload size={16} />}
          />
          <StepTab
            active={status === "completed"}
            label="Evaluation"
            icon={<CheckCircle2 size={16} />}
          />
        </div>

        <div className="p-4 sm:p-6 md:p-10">
          {status === "list" && (
            <SubmissionList
              submissions={submissions}
              assignmentId={assignmentId}
              isGrouped={!!assignmentData?.is_grouped}
              isGroupLeader={!!groupMeta.isLeader}
              groupName={groupMeta.name}
              inGroup={!!groupMeta.id}
              onSelectSubmission={(sub) => {
                setActiveSubmission(sub);
                setResults(sub.test_results || []);
                setStatus("completed");
              }}
            >
              {new Date(assignmentData?.deadline) >= new Date() &&
                (!assignmentData?.is_grouped || groupMeta.isLeader) && (
                  <button
                    onClick={() => resetWorkflow("upload")}
                    className="w-full sm:w-auto cursor-pointer group flex items-center justify-center gap-2 bg-primary text-white px-5 py-3.5 sm:py-3 rounded-md font-black uppercase text-[10px] tracking-[0.2em] shadow-md hover:bg-accent transition-all"
                  >
                    <PlusIcon
                      size={16}
                      className="text-secondary group-hover:rotate-90 transition-transform"
                    />
                    New Submission
                  </button>
                )}
            </SubmissionList>
          )}

          {status === "upload" && (
            <div className="space-y-6">
              {/* Submission Mode Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex p-1 bg-slate-100 border border-border rounded-lg shadow-inner">
                  <button
                    onClick={() => setSubmissionMode("file")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${submissionMode === "file" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-primary"}`}
                  >
                    <FileUp size={14} /> File
                  </button>
                  <button
                    onClick={() => setSubmissionMode("editor")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${submissionMode === "editor" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-primary"}`}
                  >
                    <Type size={14} /> Editor
                  </button>
                </div>
              </div>

              {submissionMode === "file" ? (
                <FileUpload
                  files={files}
                  setFiles={setFiles}
                  handleUpload={handleUpload}
                  language={assignmentData?.language}
                >
                  <button
                    onClick={() => resetWorkflow("list")}
                    className="cursor-pointer flex items-center gap-2 text-text-muted hover:text-accent font-bold text-[10px] uppercase tracking-widest transition-colors py-2"
                  >
                    <ChevronLeft size={16} /> Back to History
                  </button>
                </FileUpload>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  <p className="text-center text-[10px] font-bold text-text-muted uppercase tracking-widest max-w-lg mx-auto">
                    Editor submits one source file. For multiple files in one
                    attempt, use <span className="text-primary">File</span> and
                    select every <span className="font-mono">.py</span> or{" "}
                    <span className="font-mono">.java</span> in your project.
                  </p>
                  <EditableCodeBlock
                    code={editorCode}
                    onCodeChange={setEditorCode}
                    name={editorFileName}
                    onFileNameChange={setEditorFileName}
                    className="rounded-lg min-h-[440px] shadow-inner border-border"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <button
                      onClick={handleUpload}
                      className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 rounded bg-primary text-white font-black uppercase text-[10px] tracking-[0.25em] transition-all hover:bg-accent shadow-lg active:scale-95"
                    >
                      <Terminal size={14} className="text-secondary" />
                      Run Code Evaluator
                    </button>
                    <button
                      onClick={() => resetWorkflow("list")}
                      className="cursor-pointer flex items-center gap-2 text-text-muted hover:text-accent font-bold text-[10px] uppercase tracking-widest transition-colors py-2"
                    >
                      <ChevronLeft size={16} /> Back to History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "uploading" && (
            <div className="py-8 sm:py-12">
              <PollingView />
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-6 sm:space-y-8">
              <CodeReport
                results={results}
                submission={activeSubmission}
                assignmentId={assignmentId}
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-border/50">
                <button
                  onClick={() => resetWorkflow("list")}
                  className="w-full sm:flex-1 cursor-pointer flex items-center justify-center gap-2 px-5 py-4 border-2 border-primary text-primary font-black uppercase text-[10px] tracking-widest rounded hover:bg-primary/5 transition-colors order-2 sm:order-1"
                >
                  <List size={16} /> History
                </button>
                {(!assignmentData?.is_grouped || groupMeta.isLeader) && (
                  <button
                    onClick={() => resetWorkflow("upload")}
                    className="w-full sm:flex-1 cursor-pointer flex items-center justify-center gap-2 px-5 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded shadow-lg hover:bg-accent transition-all order-1 sm:order-2"
                  >
                    <RotateCcw size={16} className="text-secondary" /> Submit
                    Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center px-4">
        <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-widest leading-loose">
          Having trouble? <br className="sm:hidden" /> Contact support or{" "}
          <span className="text-primary font-bold underline cursor-pointer inline-flex items-center gap-1">
            <HelpCircle size={12} /> Help Center
          </span>
        </p>
      </div>
    </div>
  );
}

function StepTab({ active, label, icon }) {
  return (
    <div
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 border-b-2 transition-all ${active ? "border-primary bg-surface text-primary" : "border-transparent text-text-muted opacity-40"}`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-widest">
        {label}
      </span>
    </div>
  );
}
