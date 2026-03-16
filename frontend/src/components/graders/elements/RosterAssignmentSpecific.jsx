"use client";

import {
  Trash2,
  Users,
  Mail,
  ExternalLink,
  Hash,
  FileText,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Roster({
  onDelete = null,
  rosters,
  searchTerm = null,
  onClick = null,
}) {
  const current_pathname = usePathname();

  return (
    <div className="bg-white border-y md:border border-border animate-in fade-in duration-500">
      {rosters.length > 0 ? (
        <>
          {/* DESKTOP VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] w-1/2">
                    Student Identification
                  </th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] w-1/3">
                    Contact Email
                  </th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right w-44">
                    Submission Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rosters.map((entry) => (
                  <RosterRow
                    key={entry.id}
                    entry={entry}
                    onDelete={onDelete}
                    onClick={onClick}
                    current_pathname={current_pathname}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden divide-y divide-border">
            {rosters.map((entry) => (
              <RosterCard
                key={entry.id}
                entry={entry}
                onDelete={onDelete}
                onClick={onClick}
                current_pathname={current_pathname}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState searchTerm={searchTerm} />
      )}
    </div>
  );
}

const RosterRow = ({ entry, onDelete, onClick, current_pathname }) => {
  const user = entry.student_profile?.user;

  return (
    <tr
      onClick={() => onClick?.(entry, current_pathname)}
      className="hover:bg-primary/5 transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-black text-[10px] uppercase shadow-sm">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-accent text-sm leading-none uppercase tracking-tight">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="flex items-center gap-1 text-[10px] font-mono text-text-muted mt-1.5 uppercase tracking-tighter">
              <Hash size={10} className="text-secondary" /> {user?.cwid}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <a
          href={`mailto:${user?.email}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-primary hover:underline font-bold tracking-tight"
        >
          {user?.email}
        </a>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(entry, current_pathname);
            }}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors group/btn"
          >
            Submissions
            <ExternalLink
              size={14}
              className="group-hover/btn:translate-x-0.5 transition-transform"
            />
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry);
              }}
              className="p-2 text-text-muted hover:text-error transition-colors"
              title="Remove Student"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const RosterCard = ({ entry, onDelete, onClick, current_pathname }) => {
  const user = entry.student_profile?.user;

  return (
    <div
      onClick={() => onClick?.(entry, current_pathname)}
      className="p-5 flex items-center justify-between gap-4 active:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="font-black text-accent text-sm uppercase tracking-tight">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-[10px] font-bold text-primary truncate mt-1">
          {user?.email}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded text-[9px] font-black uppercase tracking-widest">
          <FileText size={12} /> View
        </button>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry);
            }}
            className="p-2 text-text-muted"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ searchTerm }) => (
  <div className="py-16 text-center">
    <Users size={32} className="mx-auto text-border mb-4" />
    <h3 className="text-[11px] font-black text-accent uppercase tracking-widest">
      {searchTerm ? "No Matches Found" : "Roster Empty"}
    </h3>
  </div>
);
