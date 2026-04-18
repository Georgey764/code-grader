"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import RubricGradingForm from "./RubricGradingForm";

export default function GradingModal({ submission, assignmentId, onClose }) {
  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-3xl flex flex-col rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 bg-white overflow-hidden max-h-[90vh]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white border border-border text-slate-500 hover:bg-slate-50 shadow-sm"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <RubricGradingForm
          submission={submission}
          assignmentId={assignmentId}
          subtitle={
            submission?.student_detail?.full_name ||
            `Submission ${String(submission?.id || "").slice(0, 8)}`
          }
          className="rounded-none border-0 shadow-none flex-1 min-h-0 max-h-full"
          onSaved={onClose}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
