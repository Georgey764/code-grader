"use client";

import React, { useState, useEffect } from "react";
import { useMetadata } from "@/context";

export default function AssignmentUploadPage({ courseId, assignmentId }) {
  const { api, user, isLoading, baseUrl } = useMetadata();

  // State Management
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | polling | completed
  const [results, setResults] = useState([]);
  const [submission, setSubmission] = useState();
  const [progress, setProgress] = useState(0);
  const [roster, setRoster] = useState({});
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
        const [assignmentResponse, userResponse] = await Promise.all([
          api.get(`assignments/${assignmentId}`),
          api.get(
            `accounts/${user?.role == "FA" ? "faculty" : "student"}/${user?.cwid}`,
          ),
        ]);

        const foundRoster = userResponse?.data?.rosters.find((roster) => {
          return roster.course.id == courseId;
        });
        setRoster(foundRoster);

        setAssignmentData(assignmentResponse.data);
      } catch (err) {
        console.log(err?.response?.data);
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
      setStatus("idle");
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
      setStatus("idle");
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
      setStatus("idle");
      console.log(e?.response?.data);
      alert("Upload failed: " + e.toString());
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header with ULM Branding */}
        <header className="border-b-2 border-secondary pb-6">
          <span className="text-subheading mb-2 block">
            Warhawk Learning Management
          </span>
          <h1 className="text-h1">{assignmentData?.name}</h1>
          <p className="text-body mt-2 opacity-80">
            {assignmentData?.description}
          </p>
          <p>Deadline: {assignmentData?.deadline}</p>
          <p>Max Points: {assignmentData?.max_points_allowed}</p>
          <p>
            Is Grouped Assignment:{" "}
            {assignmentData?.is_grouped ? "True" : "False"}
          </p>
          {assignmentData?.starter_code && (
            <a href={`${assignmentData?.starter_code}`} target="_blank">
              <button className="px-4 py-2 bg-primary text-white rounded">
                Starter Code
              </button>
            </a>
          )}
        </header>

        {/* 1. Upload View */}
        {status === "idle" && (
          <section className="bg-surface p-10 rounded-lg border border-border shadow-subtle transition-all">
            <h2 className="text-h2 mb-6 border-none">Submit Your Code</h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-secondary/40 rounded-lg cursor-pointer bg-background hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="text-sm text-text-muted">
                      <span className="font-bold text-primary">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {file ? file.name : "No file selected"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".py"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={!file}
                className="w-full bg-primary text-white font-bold py-4 rounded-md shadow-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
              >
                Submit for Grading
              </button>
            </form>
          </section>
        )}

        {/* 2. Loading / Polling View */}
        {(status === "uploading" || status === "polling") && (
          <section className="bg-surface p-12 rounded-lg border border-border shadow-subtle text-center">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-secondary transition-all duration-500 ease-out"
                style={{
                  width: `${status === "uploading" ? "30%" : progress}%`,
                }}
              ></div>
            </div>
            <h2 className="text-h2 border-none">
              {status === "uploading"
                ? "Uploading File..."
                : "Grading in Progress..."}
            </h2>
            <p className="text-body mt-4 text-text-muted animate-pulse">
              Please do not refresh the page. Your code is being run against our
              test suite.
            </p>
          </section>
        )}

        {/* 3. Results View */}
        {status === "completed" && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="bg-surface p-8 rounded-lg border-l-8 border-primary shadow-subtle">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-h2 border-none">Test Execution Summary</h2>
                {/* <span className="text-h1 text-secondary">75%</span> */}
              </div>

              <div className="space-y-4">
                {results.map((test, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background border border-border rounded-md"
                  >
                    <div>
                      <h4 className="font-bold text-text-main">
                        Test Case {index + 1}
                      </h4>
                      {test?.stdout && (
                        <p className="text-error text-sm font-mono mt-1">
                          Output: {test?.stdout}
                        </p>
                      )}
                      {test?.stderr && (
                        <p className="text-error text-sm font-mono mt-1">
                          {test?.stderr}
                        </p>
                      )}
                    </div>
                    <span
                      className={`mt-2 md:mt-0 px-4 py-1 rounded-full text-xs font-bold uppercase ${test?.is_success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {test?.exit_code ? "Failed" : "Success"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setFile(null);
                setProgress(0);
              }}
              className="px-6 py-2 border-2 border-primary text-primary font-bold rounded hover:bg-primary hover:text-white transition-colors"
            >
              Try Again
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
