"use client";

import React, { useState, useEffect } from "react";
import { useMetadata } from "@/context";
import { ArrowLeft, List, PlusIcon } from "lucide-react";
import Link from "next/link";
import FileUpload from "./FileUpload";
import PollingView from "./PollingView";
import ResultsView from "./ResultsView";
import AssignmentDetails from "./AssignmentDetails";
import SubmissionList from "./SubmissionList";
import { BackButton } from "@/components/ui/elements";

export default function AssignmentUploadPage({ courseId, assignmentId }) {
  const { api, user, isLoading, baseUrl, name } = useMetadata();

  // State Management
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("list"); // list | upload | uploading | polling | completed
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [roster, setRoster] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    name: "",
    description: "",
    deadline: "",
    starter_code: "",
    max_points_allowed: "",
    is_grouped: "",
  });

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [assignmentResponse, rosterResponse] = await Promise.all([
          api.get(`assignments/${assignmentId}`),
          api.get(`courses/roster?courseId=${courseId}`),
        ]);
        setRoster(rosterResponse?.data?.at(0));
        setSubmissions(rosterResponse?.data?.at(0)?.submissions);
        setAssignmentData(assignmentResponse.data);
      } catch (err) {
        console.log(err?.response);
        alert("Failed to fetch assignment & roster details");
      }
    };

    fetchPageData();
  }, [api, assignmentId, courseId, user]);

  const pollStudentSubmission = async (submission, attempt = 0) => {
    setStatus("polling");
    attempt = attempt + 1;
    try {
      const response = await api.get(
        `assessments/submissions/${submission?.id}`,
      );
      if (response.data.status == "COMPLETE") {
        setResults(response?.data?.test_results);
        setStatus("completed");
      } else if (attempt > 20) {
        throw new Error("Test run timed out");
      } else {
        setProgress((cur) => cur <= 90 && cur + 10);
        setTimeout(() => pollStudentSubmission(submission, attempt), 2000);
      }
    } catch (e) {
      setStatus("upload");
      console.log(e?.response?.data);
      alert(`Error while running code: ${e?.toString()}`);
    }
  };

  const runTests = async (submission) => {
    try {
      const response = await api.post(
        `assessments/submissions/${submission?.id}/run-tests/`,
      );
      pollStudentSubmission(submission);
    } catch (e) {
      setStatus("upload");
      alert("Error while running tests");
      console.log(e?.response?.data);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("assignment", assignmentData?.id);
    formData.append("roster", roster?.id);
    if (assignmentData?.group) {
      formData.append("group", assignmentData?.group);
    }
    formData.append("submitted_file", file);

    try {
      const response = await api.post("assessments/submissions/", formData);

      runTests(response.data);
    } catch (e) {
      setStatus("upload");
      console.log(e?.response?.data);
      alert("Upload failed: " + e.toString());
    }
  };

  return (
    <div className="bg-background p-4">
      {/* Back navigation */}
      <BackButton link={`/student/courses/${courseId}/assignments/`} />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header with ULM Branding */}
        <AssignmentDetails assignmentData={assignmentData} />

        {/* List view */}
        {status == "list" && (
          <SubmissionList
            setFile={setFile}
            setProgress={setProgress}
            setStatus={setStatus}
            submissions={submissions}
          >
            <button
              onClick={() => {
                setStatus("upload");
                setFile(null);
                setProgress(0);
              }}
              className="cursor-pointer flex items-center gap-2 bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
            >
              <PlusIcon size={18} />
              Upload New Submission
            </button>
          </SubmissionList>
        )}

        {/* 1. Upload View */}
        {status === "upload" && (
          <FileUpload file={file} setFile={setFile} handleUpload={handleUpload}>
            <button
              onClick={() => {
                setStatus("list");
                setFile(null);
                setProgress(0);
              }}
              className="cursor-pointer flex items-center gap-2 bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
            >
              <List size={18} />
              View All Submissions
            </button>
          </FileUpload>
        )}

        {/* 2. Loading / Polling View */}
        {(status === "uploading" || status === "polling") && (
          <PollingView status={status} progress={progress} />
        )}

        {/* 3. Results View */}
        {status === "completed" && (
          <>
            <ResultsView results={results} />
            <div className="flex flex-row gap-4">
              <button
                onClick={() => {
                  setStatus("list");
                  setFile(null);
                  setProgress(0);
                }}
                className="cursor-pointer px-6 py-2 border-2 border-primary text-primary font-bold rounded hover:bg-primary hover:text-white transition-colors"
              >
                View All Submissions
              </button>
              <button
                onClick={() => {
                  setStatus("upload");
                  setFile(null);
                  setProgress(0);
                }}
                className="cursor-pointer px-6 py-2 border-2 border-primary text-primary font-bold rounded hover:bg-primary hover:text-white transition-colors"
              >
                Submit Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
