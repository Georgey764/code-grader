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
} from "lucide-react";
import FileUpload from "./FileUpload";
import PollingView from "./PollingView";
import ResultsView from "./ResultsView";
import AssignmentDetails from "./AssignmentDetails";
import SubmissionList from "./SubmissionList";

export default function AssignmentUploadPage({ courseId, assignmentId }) {
  const { api, user } = useMetadata();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("list");
  const [results, setResults] = useState([]);
  const [rubricResults, setRubricResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [roster, setRoster] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [assignmentData, setAssignmentData] = useState(null);

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
        setRoster(rosterResponse?.data?.at(0));
        setSubmissions(submissionResponse?.data);
        setAssignmentData(assignmentResponse?.data);
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };

    fetchPageData();
  }, [api, assignmentId, courseId, user]);

  const pollStudentSubmission = async (submission, attempt = 0) => {
    setStatus("polling");
    const nextAttempt = attempt + 1;

    try {
      const response = await api.get(
        `assessments/submissions/${submission?.id}/`,
      );

      if (response.data.status === "COMPLETE") {
        setResults(response?.data?.test_results || []);
        setRubricResults(response?.data?.rubric_results || []);
        setStatus("completed");
        api
          .get(`assessments/submissions/?assignment_id=${assignmentId}`)
          .then((res) => setSubmissions(res.data));
      } else if (nextAttempt > 25) {
        throw new Error("Evaluation timed out. Check history shortly.");
      } else {
        setProgress((cur) => (cur <= 90 ? cur + 5 : 95));
        setTimeout(() => pollStudentSubmission(submission, nextAttempt), 2000);
      }
    } catch (e) {
      setStatus("list");
      alert(`Error during evaluation: ${e.message}`);
    }
  };

  const runTests = async (submission) => {
    try {
      await api.post(`assessments/submissions/${submission?.id}/run-tests/`);
      pollStudentSubmission(submission);
    } catch (e) {
      setStatus("upload");
      alert("Test execution failed to start.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("assignment", assignmentId);
    formData.append("roster", roster?.id);
    if (assignmentData?.is_grouped) {
      formData.append("group", assignmentData?.group_id);
    }
    formData.append("submitted_file", file);

    try {
      const response = await api.post("assessments/submissions/", formData);
      runTests(response.data);
    } catch (e) {
      setStatus("upload");
      alert("Upload failed. Ensure your file meets requirements.");
    }
  };

  const resetWorkflow = (targetStatus = "list") => {
    setStatus(targetStatus);
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-12 sm:pb-20 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* 1. Responsive Header Section */}
      <AssignmentDetails assignmentData={assignmentData} />

      {/* 2. Main Workspace Card with Adaptive Padding */}
      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden relative">
        {/* Step Indicator Bar - Simplified for Mobile */}
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
            active={status === "polling" || status === "completed"}
            label="Evaluation"
            icon={<CheckCircle2 size={16} />}
          />
        </div>

        <div className="p-4 sm:p-6 md:p-10">
          {/* View Controller */}
          {status === "list" && (
            <SubmissionList
              submissions={submissions}
              rubricCriteriaCount={assignmentData?.rubric_criterias?.length || 0}
              onSelectSubmission={(sub) => {
                setResults(sub.test_results || []);
                setRubricResults(sub.rubric_results || []);
                setStatus("completed");
              }}
            >
              <button
                onClick={() => resetWorkflow("upload")}
                className="w-full sm:w-auto cursor-pointer group flex items-center justify-center gap-2 bg-primary text-white px-5 py-3.5 sm:py-3 rounded-md font-black uppercase text-[10px] tracking-[0.2em] shadow-md hover:bg-accent transition-all active:scale-95"
              >
                <PlusIcon
                  size={16}
                  className="text-secondary group-hover:rotate-90 transition-transform"
                />
                New Submission
              </button>
            </SubmissionList>
          )}

          {status === "upload" && (
            <div className="space-y-6">
              <FileUpload
                file={file}
                setFile={setFile}
                handleUpload={handleUpload}
              >
                <button
                  onClick={() => resetWorkflow("list")}
                  className="cursor-pointer flex items-center gap-2 text-text-muted hover:text-accent font-bold text-[10px] uppercase tracking-widest transition-colors py-2"
                >
                  <ChevronLeft size={16} />
                  Back to History
                </button>
              </FileUpload>
            </div>
          )}

          {(status === "uploading" || status === "polling") && (
            <div className="py-8 sm:py-12">
              <PollingView status={status} progress={progress} />
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-6 sm:space-y-8">
              <ResultsView results={results} rubricResults={rubricResults} />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-border/50">
                <button
                  onClick={() => resetWorkflow("list")}
                  className="w-full sm:flex-1 cursor-pointer flex items-center justify-center gap-2 px-5 py-4 sm:py-3 border-2 border-primary text-primary font-black uppercase text-[10px] tracking-widest rounded hover:bg-primary/5 transition-colors order-2 sm:order-1"
                >
                  <List size={16} />
                  View All Submissions
                </button>
                <button
                  onClick={() => resetWorkflow("upload")}
                  className="w-full sm:flex-1 cursor-pointer flex items-center justify-center gap-2 px-5 py-4 sm:py-3 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded shadow-lg hover:bg-accent transition-all order-1 sm:order-2"
                >
                  <RotateCcw size={16} className="text-secondary" />
                  Submit Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile-Optimized Footer */}
      <div className="text-center px-4">
        <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-widest leading-loose">
          Having trouble? <br className="sm:hidden" /> Contact your instructor
          or{" "}
          <span className="text-primary font-bold underline cursor-pointer inline-flex items-center gap-1">
            <HelpCircle size={12} /> System Support
          </span>
        </p>
      </div>
    </div>
  );
}

/** * Helper for the adaptive step tabs */
function StepTab({ active, label, icon }) {
  return (
    <div
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 border-b-2 transition-all ${
        active
          ? "border-primary bg-surface text-primary"
          : "border-transparent text-text-muted opacity-40"
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-widest">
        {label}
      </span>
    </div>
  );
}
