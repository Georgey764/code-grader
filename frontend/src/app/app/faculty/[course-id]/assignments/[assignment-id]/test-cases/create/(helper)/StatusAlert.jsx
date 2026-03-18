import { AlertCircle, CheckCircle2 } from "lucide-react";
import React from "react";

export default function StatusAlert({ type, message }) {
  return (
    <div
      className={`p-4 rounded-md flex items-start gap-3 border animate-in zoom-in duration-300 ${
        type === "error"
          ? "bg-red-50 border-red-200 text-error"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      {type === "error" ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle2 size={20} />
      )}
      <p className="whitespace-pre-line text-xs font-bold leading-relaxed">
        {message.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
