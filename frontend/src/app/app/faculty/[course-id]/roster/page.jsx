"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Roster } from "@/components/graders/elements";
import { Users, Search, IdCard, AlertTriangle, X } from "lucide-react";

export default function RosterListPage() {
  const { api, user } = useMetadata(); // Assuming 'user' containing role is in metadata
  const params = useParams();
  const courseId = params["course-id"];

  // Logic to determine if user is Faculty
  const isFaculty = user?.role === "FACULTY";

  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const response = await api.get(`courses/${courseId}/rosters/`);
        setRoster(response.data);
      } catch (error) {
        console.error("Failed to fetch roster", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchRoster();
  }, [courseId, api]);

  const confirmDelete = (entry) => {
    setEntryToDelete(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`courses/${courseId}/rosters/${entryToDelete.id}/`);
      setRoster((prev) => prev.filter((item) => item.id !== entryToDelete.id));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete student", error);
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
    }
  };

  const filteredRoster = roster.filter((entry) => {
    const student = entry.student_profile?.user;
    const fullName =
      `${student?.first_name} ${student?.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student?.cwid?.toString().includes(searchTerm)
    );
  });

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6 relative">
      {/* Header Stat & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="bg-surface border border-border p-4 rounded-lg flex items-center gap-4 shadow-subtle min-w-[240px]">
          <div className="p-3 bg-primary/5 text-primary rounded-md">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
              Enrolled Students
            </p>
            <p className="text-2xl font-black text-accent tracking-tight">
              {roster.length}
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-xl group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or CWID..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-lg outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Roster Main - Passing role and removing onViewResults */}
      <Roster
        searchTerm={searchTerm}
        rosters={filteredRoster}
        onDelete={isFaculty ? confirmDelete : null}
        role={user?.role}
      />

      {/* Confirmation Modal - Only accessible if isFaculty */}
      {isModalOpen && isFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/40 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-error/10 text-error rounded-lg">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-text-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-accent uppercase tracking-tight">
                  Remove Student?
                </h3>
                <p className="text-sm text-text-muted">
                  Remove{" "}
                  <span className="font-bold">
                    {entryToDelete?.student_profile?.user?.first_name}
                  </span>{" "}
                  from the course?
                </p>
              </div>
            </div>

            <div className="p-4 bg-background flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold uppercase text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-error text-white text-xs font-black uppercase rounded"
              >
                {isDeleting ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="p-5 bg-background border border-border rounded-lg border-dashed flex gap-4 items-start">
        <div className="p-2 bg-accent/5 text-accent rounded">
          <IdCard size={18} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-accent tracking-widest">
            Data Privacy
          </p>
          <p className="text-[11px] text-text-muted">
            FERPA protected academic data.
          </p>
        </div>
      </footer>
    </div>
  );
}
