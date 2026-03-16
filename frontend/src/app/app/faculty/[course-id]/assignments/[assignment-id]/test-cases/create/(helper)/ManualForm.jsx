import { Clock, CornerDownRight, EyeOff, Layers } from "lucide-react";
import StatusAlert from "./StatusAlert";
import React from "react";

export default function ManualForm({
  formData,
  loading,
  status,
  onChange,
  onSubmit,
  onFileChange,
  isFileInput = false,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <CornerDownRight size={14} className="text-secondary" />{" "}
            {isFileInput ? "Upload Input File" : "Standard Input"}
          </label>
          {isFileInput ? (
            <input
              type="file"
              name="input_file"
              onChange={onFileChange}
              className="w-full p-3 bg-background border border-border rounded text-sm focus:ring-1 focus:ring-secondary outline-none"
            />
          ) : (
            <textarea
              name="input_content"
              value={formData.input_content}
              onChange={onChange}
              className="w-full min-h-[120px] p-4 bg-background border border-border rounded font-mono text-sm focus:ring-1 focus:ring-secondary outline-none"
              placeholder="e.g. 5\n10"
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <CornerDownRight size={14} className="text-secondary" /> Expected
            Output
          </label>
          <textarea
            name="expected_output"
            value={formData.expected_output}
            onChange={onChange}
            className="w-full min-h-[120px] p-4 bg-background border border-border rounded font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
            placeholder="e.g. 15"
            required
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
