export default function TemplateGuide() {
  return (
    <div className="bg-slate-50 border border-border rounded-lg p-5 animate-in slide-in-from-top-2 duration-300">
      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">
        Required JSON Structure
      </p>
      <pre className="text-[11px] font-mono text-accent leading-relaxed bg-white p-4 rounded border border-border overflow-x-auto">
        {`[
  {
    "text_input": "5\\n10",
    "expected_output": "15",
    "time_limit": 1000,
    "is_hidden": false
  }
]`}
      </pre>
      <p className="text-[9px] text-text-muted mt-3 italic">
        * Ensure escaped characters like newlines (\\n) are properly formatted
        in strings.
      </p>
    </div>
  );
}
