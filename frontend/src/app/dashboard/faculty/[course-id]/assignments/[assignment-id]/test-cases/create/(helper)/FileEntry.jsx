import {
  Clock,
  CornerDownRight,
  EyeOff,
  Layers,
  Upload,
  X,
} from "lucide-react";
import StatusAlert from "./StatusAlert";
import React, { useRef } from "react";

export default function FileEntry({
  formData,
  loading,
  status,
  onChange,
  onSubmit,
  onFileRemove,
  onFileChange,
  inputFiles,
  outputFiles,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <CornerDownRight size={14} className="text-secondary" /> Standard
            Input
          </label>

          <FileUploadBox
            onFileChange={onFileChange}
            type="input"
            inputFiles={inputFiles}
            outputFiles={outputFiles}
            onFileRemove={onFileRemove}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <CornerDownRight size={14} className="text-secondary" /> Expected
            Output
          </label>

          <FileUploadBox
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
            type="output"
            inputFiles={inputFiles}
            outputFiles={outputFiles}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-border/50">
        <ConfigInput
          icon={<Clock size={16} />}
          label="Timeout (ms)"
          name="time_limit"
          value={formData.time_limit}
          onChange={onChange}
        />
      </div>

      <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded border border-border">
        <input
          type="checkbox"
          name="is_hidden"
          checked={formData.is_hidden}
          onChange={onChange}
          className="w-5 h-5 accent-primary mt-1"
        />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
            <EyeOff size={14} /> Hidden Test Case
          </p>
          <p className="text-[11px] text-text-muted">
            Hide inputs/outputs from student results to prevent hard-coding.
          </p>
        </div>
      </div>

      {status.message && (
        <StatusAlert type={status.type} message={status.message} />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary text-white font-black rounded shadow-lg transition-all uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Layers size={16} className="animate-spin" />
        ) : (
          "Register Test Case"
        )}
      </button>
    </form>
  );
}

function ConfigInput({ icon, label, name, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
        {React.cloneElement(icon, { size: 14, className: "text-primary" })}{" "}
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2.5 bg-background border border-border rounded text-sm font-bold focus:ring-1 focus:ring-secondary outline-none"
        min="0"
      />
    </div>
  );
}

function FileInputWarning() {
  return (
    <div className="mt-4 p-3 border border-yellow-300 bg-yellow-50 rounded-md text-xs text-gray-700">
      <p className="font-semibold mb-2">⚠️ File Naming Rules</p>

      <ul className="list-disc ml-4 space-y-1">
        <li>
          Input files must follow:{" "}
          <span className="font-mono bg-gray-100 px-1 rounded">
            input_[number].txt
          </span>
        </li>
        <li>
          Output files must follow:{" "}
          <span className="font-mono bg-gray-100 px-1 rounded">
            output_[same_number].txt
          </span>
        </li>
        <li>
          Each input file must have a corresponding output file with the same
          number.
        </li>
      </ul>

      <p className="mt-2">
        Example:{" "}
        <span className="font-mono bg-gray-100 px-1 rounded">input_1.txt</span>
        {" → "}
        <span className="font-mono bg-gray-100 px-1 rounded">output_1.txt</span>
      </p>
    </div>
  );
}

function FileUploadBox({
  onFileChange,
  onFileRemove,
  type,
  inputFiles,
  outputFiles,
}) {
  const files = type === "input" ? inputFiles : outputFiles;
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const incoming = Array.from(e.target.files);
    const merged = [
      ...files,
      ...incoming.filter(
        (f) => !files.some((existing) => existing.name === f.name),
      ),
    ];
    onFileChange(merged, type);
    e.target.value = ""; // reset so same file can be re-added after removal
  };

  return (
    <div className="space-y-2">
      {/* Uploaded file chips */}
      {files?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/20 text-primary rounded-lg text-xs font-semibold max-w-[180px]"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onFileRemove(file, type)}
                className="hover:text-error transition-colors"
              >
                <X size={11} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden input, triggered by button */}
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
      >
        <Upload size={13} /> Add {type} files
      </button>

      <FileInputWarning />
    </div>
  );
}
