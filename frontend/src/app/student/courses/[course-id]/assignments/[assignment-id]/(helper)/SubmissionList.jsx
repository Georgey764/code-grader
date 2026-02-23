"use client";

import React, { useEffect, useState } from "react";

import { PlusIcon, FileIcon, InboxIcon, Hash, List } from "lucide-react";
import ResultsView from "./ResultsView";

function ViewTestResult({ viewingTest = [], setViewingTest }) {
  return (
    <ResultsView results={viewingTest}>
      <button
        onClick={() => {
          setViewingTest(null);
        }}
        className="cursor-pointer flex items-center gap-2 bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
      >
        <List size={18} />
        View All Submission
      </button>
    </ResultsView>
  );
}

function ViewList({ setViewingTest, submissions = [], children = null }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETE":
        return "bg-primary-100 text-primary border-primary/20";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "INCOMPLETE":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Submissions
          </h1>
          <p className="text-sm text-gray-500">
            View and manage your code uploads.
          </p>
        </div>
        {children}
      </div>

      {/* Main Content Area */}
      {submissions.length === 0 ? (
        // Empty State - Shown when no submissions exist
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-20 bg-gray-50/40">
          <div className="bg-white p-5 rounded-full shadow-sm mb-4">
            <InboxIcon className="text-gray-300" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            No submissions found
          </h3>
          <p className="text-gray-500 max-w-sm text-center mt-2 px-4">
            It looks like you haven&#39;t uploaded any work yet. Click the
            upload button to submit your first assignment.
          </p>
        </div>
      ) : (
        // Submissions Table - Shown when there is data
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Attempt
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub, index) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                          <Hash size={20} />
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[180px]">
                          {index + 1}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(sub.status)}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60"></span>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setViewingTest(sub?.test_results);
                        }}
                        className="cursor-pointer text-primary/60 hover:text-primary text-sm font-bold transition-colors"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const SubmissionsList = ({ submissions = [], children = null }) => {
  const [viewingTest, setViewingTest] = useState(null);
  // Helper to color-code the ENUM status

  return viewingTest ? (
    <ViewTestResult viewingTest={viewingTest} setViewingTest={setViewingTest} />
  ) : (
    <ViewList setViewingTest={setViewingTest} submissions={submissions}>
      {children}
    </ViewList>
  );
};

export default SubmissionsList;
