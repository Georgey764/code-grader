"use client";

import {
  Trash2,
  UserCircle,
  Users,
  Hash,
  Mail,
  ChevronRight,
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
    <div className="bg-surface rounded-xl border border-border shadow-subtle overflow-hidden">
      {rosters.length > 0 ? (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="p-4 text-subheading text-[10px] w-1/3">
                    Student Identification
                  </th>
                  <th className="p-4 text-subheading text-[10px] w-1/4">
                    Academic Path
                  </th>
                  <th className="p-4 text-subheading text-[10px] w-1/4">
                    Contact
                  </th>
                  <th className="p-4 text-subheading text-[10px] text-right w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rosters.map((entry) => (
                  <RosterRow
                    current_pathname={current_pathname}
                    key={entry.id}
                    entry={entry}
                    onDelete={onDelete}
                    onClick={onClick}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-border">
            {rosters.map((entry) => (
              <RosterCard
                current_pathname={current_pathname}
                key={entry.id}
                entry={entry}
                onDelete={onDelete}
                onClick={onClick}
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

const RosterCard = ({
  entry,
  onDelete = null,
  onClick = null,
  current_pathname,
}) => {
  const profile = entry.student_profile;
  const user = profile?.user;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle className="text-primary/40" size={32} />
          <div>
            <p className="font-bold text-accent text-sm">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] font-mono text-text-muted tracking-tighter uppercase">
              CWID: {user?.cwid}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-secondary/10 border border-secondary/20 rounded text-[9px] font-black text-secondary uppercase tracking-widest">
            {profile?.classification}
          </span>
          {onDelete != null && (
            <button
              onClick={() => {
                if (onDelete != null) onDelete(entry);
              }}
              className="p-1.5 text-text-muted hover:text-error transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          {onClick != null && (
            <button
              onClick={() => {
                if (onClick != null) onClick(entry, current_pathname);
              }}
              className="cursor-pointer p-2 text-text-muted hover:text-error hover:bg-error/5 rounded-full transition-all"
              title="View this submission"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-border">
        <div>
          <p className="text-[9px] uppercase font-black text-text-muted tracking-widest mb-1">
            Major
          </p>
          <p className="text-xs font-bold text-accent truncate">
            {profile?.major}
          </p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-black text-text-muted tracking-widest mb-1">
            Email
          </p>
          <a
            href={`mailto:${user?.email}`}
            className="text-xs font-bold text-primary underline truncate block"
          >
            {user?.email}
          </a>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ searchTerm = null }) => (
  <div className="p-16 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4 text-border">
      <Users size={32} />
    </div>
    <h3 className="text-sm font-black text-accent uppercase tracking-[0.2em]">
      No Matches Found
    </h3>
    <p className="text-xs text-text-muted max-w-xs mx-auto mt-2 italic">
      {searchTerm
        ? `No students found matching "${searchTerm}"`
        : "The course roster is currently empty."}
    </p>
  </div>
);

const RosterRow = ({
  entry,
  onDelete = null,
  onClick = null,
  current_pathname,
}) => {
  const profile = entry.student_profile;
  const user = profile?.user;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-black text-xs border-2 border-secondary/20 uppercase">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-accent text-sm leading-tight tracking-tight">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="flex items-center gap-1 text-[10px] font-mono text-text-muted mt-0.5 uppercase tracking-tighter">
              <Hash size={10} className="text-secondary" /> {user?.cwid}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <p className="text-xs font-bold text-text-main uppercase tracking-tight truncate">
          {profile?.major}
        </p>
        <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-0.5">
          {profile?.classification}
        </p>
      </td>
      <td className="p-4">
        <a
          href={`mailto:${user?.email}`}
          className="flex items-center gap-2 text-xs text-primary hover:underline font-medium"
        >
          <Mail size={14} /> {user?.email}
        </a>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-1">
          {onDelete != null && (
            <button
              onClick={() => {
                if (onDelete != null) onDelete(entry);
              }}
              className="cursor-pointer p-2 text-text-muted hover:text-error hover:bg-error/5 rounded-full transition-all"
              title="Remove from Roster"
            >
              <Trash2 size={18} />
            </button>
          )}
          {onClick != null && (
            <button
              onClick={() => {
                if (onClick != null) onClick(entry, current_pathname);
              }}
              className="cursor-pointer p-2 text-text-muted hover:text-error hover:bg-error/5 rounded-full transition-all"
              title="View this submission"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
