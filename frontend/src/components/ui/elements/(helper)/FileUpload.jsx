import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";

const FileUpload = forwardRef(({ setInputFile }, ref) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Constants for validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_EXTENSIONS = [".txt", ".csv"];

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    // 1. Validate File Extension
    const fileName = uploadedFile.name;
    const fileExtension = fileName
      .slice(fileName.lastIndexOf("."))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError("Only .txt and .csv files are allowed.");
      event.target.value = ""; // Clear the native input
      return;
    }

    // 2. Validate File Size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Max size is 10MB.");
      event.target.value = ""; // Clear the native input
      return;
    }

    // If valid
    setError("");
    setFile(uploadedFile);
    setInputFile(uploadedFile);
  };

  const removeFile = () => {
    setFile(null);
    setInputFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useImperativeHandle(ref, () => ({
    clearFile: removeFile,
  }));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Added the 'accept' attribute to filter the file picker */}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept=".txt, .csv"
          onChange={handleFileChange}
        />

        {!file ? (
          <button
            onClick={() => fileInputRef.current.click()}
            className="cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md"
          >
            <Upload size={12} />
            Upload Input File
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-700">
            <div className="flex items-center gap-1.5">
              <File size={12} className="text-blue-400" />
              <span className="text-[10px] font-medium text-slate-200 truncate max-w-[120px]">
                {file.name}
              </span>
            </div>

            <button
              onClick={removeFile}
              className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="flex items-center gap-1 text-[10px] text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";

export default FileUpload;
