"use client";

import { Trash2, Users, Hash } from "lucide-react";

export default function Roster({ onDelete, rosters, searchTerm = null, role }) {
  const isFaculty = role.toLowerCase() === "fa";

  return (
    <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
      {rosters.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="p-4 text-[10px] text-text-muted font-black uppercase tracking-widest">
                    Student
                  </th>
                  {isFaculty && (
                    <th className="p-4 text-right w-24 text-[10px] text-text-muted font-black uppercase tracking-widest">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rosters.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-black text-xs uppercase">
                          {entry.student_profile?.user?.first_name?.[0]}
                          {entry.student_profile?.user?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-accent text-sm leading-tight">
                            {entry.student_profile?.user?.first_name}{" "}
                            {entry.student_profile?.user?.last_name}
                          </p>
                          <p className="flex items-center gap-1 text-[10px] font-mono text-text-muted uppercase">
                            <Hash size={10} />{" "}
                            {entry.student_profile?.user?.cwid}
                          </p>
                        </div>
                      </div>
                    </td>
                    {isFaculty && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDelete(entry)}
                          className="p-2 text-text-muted hover:text-error hover:bg-error/5 rounded-full transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden divide-y divide-border">
            {rosters.map((entry) => (
              <div
                key={entry.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-accent text-sm">
                    {entry.student_profile?.user?.first_name}{" "}
                    {entry.student_profile?.user?.last_name}
                  </p>
                  <p className="text-[10px] font-mono text-text-muted uppercase">
                    ID: {entry.student_profile?.user?.cwid}
                  </p>
                </div>
                {isFaculty && (
                  <button
                    onClick={() => onDelete(entry)}
                    className="p-2 text-text-muted hover:text-error"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState searchTerm={searchTerm} />
      )}
    </div>
  );
}

const EmptyState = ({ searchTerm }) => (
  <div className="p-16 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4 text-border">
      <Users size={32} />
    </div>
    <h3 className="text-sm font-black text-accent uppercase tracking-widest">
      No Matches
    </h3>
    <p className="text-xs text-text-muted mt-2">
      {searchTerm ? `No results for "${searchTerm}"` : "Roster is empty."}
    </p>
  </div>
);
