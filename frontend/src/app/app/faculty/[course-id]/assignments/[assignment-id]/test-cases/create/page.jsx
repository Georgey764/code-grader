"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMetadata } from "@/context";
import { FileCode, Layers, Info, Loader2 } from "lucide-react";
import TabButton from "./(helper)/TabButton";
import TemplateGuide from "./(helper)/TemplateGuide";
import ManualForm from "./(helper)/ManualForm";
import StatusAlert from "./(helper)/StatusAlert";

export default function CreateTestCase() {
  const params = useParams();
  const assignment_id = params["assignment-id"];
  const { api } = useMetadata();

  // State Management
  const [mode, setMode] = useState("manual"); // manual | bulk
  const [loading, setLoading] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [bulkData, setBulkData] = useState("");
  const [inputFiles, setInputFiles] = useState([]);
  const [outputFiles, setOutputFiles] = useState([]);

  const [assignment, setAssignment] = useState(null);

  const [formData, setFormData] = useState({
    text_input: "",
    expected_output: "",
    time_limit: 1000,
    is_hidden: false,
    file_input: null,
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`assignments/${assignment_id}/`);
        setAssignment(response.data);
      } catch (err) {
        console.error("Failed to load assignment details", err);
      }
    };

    fetchAssignment();
  }, [api, assignment_id]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "time_limit") finalValue = parseInt(value) || 0;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleFileChange = (files, type = null) => {
    if (status.type) setStatus({ type: null, message: "" });
    const validPattern =
      type === "input" ? /^input_[1-9]\d*\.txt$/ : /^output_[1-9]\d*\.txt$/;

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (validPattern.test(file.name)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(
        `Invalid file names:\n${invalidFiles.join(
          "\n",
        )}\n\nFiles must follow: input_[positive_number].txt`,
      );
    } else {
      if (type == "input") {
        setInputFiles(files);
        alert("Input files uploaded successfully.");
      } else {
        setOutputFiles(files);
        alert("Output files uploaded successfully.");
      }
    }
  };

  const handleFileRemove = (file, type) => {
    if (type == "input") {
      setInputFiles(inputFiles.filter((f) => f.name !== file.name));
    } else {
      setOutputFiles(outputFiles.filter((f) => f.name !== file.name));
    }
  };

  async function submitTestCases(assignmentId, inputFiles, outputFiles) {
    const warnings = [];
    const results = [];

    // Extract number from filename e.g. "input_1.txt" → 1
    const getNumber = (filename) => {
      const match = filename.match(/^(?:input|output)_(\d+)\.txt$/i);
      return match ? parseInt(match[1]) : null;
    };

    // Build a map of output files: { 1: File, 2: File, ... }
    const outputMap = {};
    for (const file of outputFiles) {
      const num = getNumber(file.name);
      if (num !== null) outputMap[num] = file;
    }

    // Process each input file sequentially
    for (const inputFile of inputFiles) {
      const num = getNumber(inputFile.name);

      if (num === null) {
        warnings.push(
          `"${inputFile.name}" does not follow input_[number].txt naming — skipped.`,
        );
        continue;
      }

      const outputFile = outputMap[num];
      if (!outputFile) {
        warnings.push(
          `No matching output_${num}.txt found for "${inputFile.name}" — skipped.`,
        );
        continue;
      }

      // Read output file content as text
      const expectedOutput = await outputFile.text();

      // Build FormData — file_input as file, text fields empty, expected_output as text
      const formData = new FormData();
      formData.append("file_input", inputFile);
      formData.append("expected_output", expectedOutput);
      formData.append("assignment", assignmentId);
      formData.append("is_hidden", false);

      try {
        const response = await api.post(
          `assignments/${assignmentId}/test-cases/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        results.push({ num, success: true, data: response.data });
      } catch (err) {
        console.log(err?.response?.data);
        results.push({ num, success: false, error: err });
        warnings.push(
          `Failed to upload test case ${num}: ${err?.message ?? "unknown error"}`,
        );
      }
    }

    return { results, warnings };
  }

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();

    // For file-input assignments
    if (assignment?.is_file_input) {
      if (inputFiles.length === 0) {
        setStatus({
          type: "error",
          message: "Please upload at least one input file.",
        });
        return;
      } else if (outputFiles.length === 0) {
        setStatus({
          type: "error",
          message: "Please upload at least one output file.",
        });
        return;
      }

      try {
        setLoading(true);
        const { results, warnings } = await submitTestCases(
          assignment_id,
          inputFiles,
          outputFiles,
        );
        const atleastOneSuccess = results.some((result) => result.success);
        const successfullFileNames = results
          .filter((result) => result.success)
          .map((result) => result.num);
        const failedFileNames = results
          .filter((result) => !result.success)
          .map((result) => result.num);
        const warningMessages = warnings.join("\n");
        const message = `Successfully uploaded ${successfullFileNames.join(", ").length} test cases.\nFailed to upload ${failedFileNames.join(", ").length} test cases.${warningMessages && "\n\nWarnings:\n"}${warningMessages}`;

        setStatus({
          type: atleastOneSuccess ? "success" : "error",
          message: message,
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: err.message || "Failed to upload test cases.",
        });
      } finally {
        setLoading(false);
        setInputFiles([]);
        setOutputFiles([]);
        setFormData({
          text_input: "",
          expected_output: "",
          time_limit: 1000,
          is_hidden: false,
          file_input: null,
        });
      }
    }

    // For text-input assignments
    if (!assignment?.is_file_input) {
      try {
        setLoading(true);
        if (assignment?.is_file_input) {
          const payload = new FormData();
          if (formData.file_input) {
            payload.append("file_input", formData.file_input);
          }
          payload.append("expected_output", formData.expected_output);
          payload.append("time_limit", String(formData.time_limit));
          payload.append("is_hidden", String(formData.is_hidden));
          payload.append("assignment", assignment_id);

          await api.post(`assignments/${assignment_id}/test-cases/`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post(`assignments/${assignment_id}/test-cases/`, {
            text_input: formData.text_input,
            expected_output: formData.expected_output,
            time_limit: formData.time_limit,
            is_hidden: formData.is_hidden,
            assignment: assignment_id,
          });
        }
        setStatus({
          type: "success",
          message: "Manual test case registered successfully.",
        });
        setFormData({
          text_input: "",
          expected_output: "",
          time_limit: 1000,
          is_hidden: false,
          file_input: null,
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: err.response?.data?.detail || "Registration failed.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (assignment?.is_file_input) {
        throw new Error(
          "Bulk JSON is only supported for text-input assignments.",
        );
      }

      const parsedData = JSON.parse(bulkData);
      if (!Array.isArray(parsedData))
        throw new Error("Data must be a JSON array.");

      // Sequential processing to ensure database integrity
      for (const item of parsedData) {
        await api.post(`assignments/${assignment_id}/test-cases/`, {
          ...item,
          assignment: assignment_id,
        });
      }

      setStatus({
        type: "success",
        message: `Successfully registered ${parsedData.length} test cases.`,
      });
      setBulkData("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Bulk parse error. Check your JSON format.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}

      {!assignment?.is_file_input && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-border">
            <TabButton
              active={mode === "manual"}
              onClick={() => setMode("manual")}
              label="Manual Entry"
            />
            <TabButton
              active={mode === "bulk"}
              onClick={() => setMode("bulk")}
              label="Bulk JSON"
            />
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden relative">
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-6 md:p-10">
          {mode === "manual" ? (
            <ManualForm
              formData={formData}
              loading={loading}
              status={status}
              onChange={handleChange}
              onSubmit={handleIndividualSubmit}
              onFileChange={handleFileChange}
              onFileRemove={handleFileRemove}
              inputFiles={inputFiles}
              outputFiles={outputFiles}
              onReset={() => setStatus({ type: null, message: "" })}
              isFileInput={!!assignment?.is_file_input}
            />
          ) : (
            <BulkForm
              bulkData={bulkData}
              setBulkData={setBulkData}
              loading={loading}
              status={status}
              handleBulkSubmit={handleBulkSubmit}
              showTemplate={showTemplate}
              setShowTemplate={setShowTemplate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BulkForm({
  showTemplate,
  setShowTemplate,
  bulkData,
  setBulkData,
  loading,
  status,
  handleBulkSubmit,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-accent">
          Bulk Register Test Cases
        </h3>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="text-[10px] font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
        >
          <Info size={14} /> {showTemplate ? "Hide Template" : "Show Template"}
        </button>
      </div>

      {showTemplate && <TemplateGuide />}

      <form onSubmit={handleBulkSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute top-4 right-4 text-text-muted opacity-20 pointer-events-none">
            <Layers size={40} />
          </div>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            className="w-full min-h-[350px] p-6 bg-slate-950 text-green-400 font-mono text-xs rounded-lg border border-border focus:ring-2 focus:ring-secondary outline-none shadow-inner"
            placeholder={`[ \n  { "text_input": "...", "expected_output": "...", "time_limit": 1000, "is_hidden": false },\n  ...\n]`}
            required
          />
        </div>

        {status.message && (
          <StatusAlert type={status.type} message={status.message} />
        )}

        <button
          type="submit"
          disabled={loading || !bulkData.trim()}
          className="w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileCode size={16} />
          )}
          {loading ? "Processing Batch..." : "Synchronize Test Suite"}
        </button>
      </form>
    </div>
  );
}
