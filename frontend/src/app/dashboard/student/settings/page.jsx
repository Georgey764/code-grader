"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { Button, Card, Input } from "@/components/ui/elements";
import {
  UserCircle,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle2,
  Fingerprint,
  Hash,
  Lock,
} from "lucide-react";

function getProfilePath(role, cwid) {
  if (!cwid) return null;
  if (role === "FA") return `accounts/faculty/${cwid}/`;
  if (role === "ST") return `accounts/student/${cwid}/`;
  if (role === "GA") return `accounts/ga/${cwid}/`;
  return null;
}

export default function StudentSettingsPage() {
  const { api, user } = useMetadata();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    uuid: "", // Non-editable profile identifier
    first_name: "",
    last_name: "",
    email: "",
    cwid: "",
    major: "",
    classification: "",
  });

  const profilePath = user?.cwid ? getProfilePath(user.role, user.cwid) : null;

  useEffect(() => {
    if (!profilePath) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await api.get(profilePath);
        const data = response.data;
        setFormData({
          uuid: data.id ?? "", // Captures the StudentProfile UUID
          first_name: data.user?.first_name ?? "",
          last_name: data.user?.last_name ?? "",
          email: data.user?.email ?? "",
          cwid: data.user?.cwid ?? "",
          major: data.major ?? "",
          classification: data.classification ?? "",
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: err.response?.data?.detail || "Failed to load profile.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [api, profilePath]);

  const handleChange = (e) => {
    if (status.type) setStatus({ type: null, message: "" });
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profilePath) return;
    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      await api.patch(profilePath, {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          cwid: formData.cwid,
        },
        major: formData.major,
        classification: formData.classification,
      });
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (err.response?.data && typeof err.response.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : "Failed to update profile.");
      setStatus({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="w-[100%] space-y-8 animate-in fade-in duration-500">
      <Card className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <UserCircle className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-accent uppercase tracking-tight">
              Student Profile
            </h2>
            <p className="text-sm text-text-muted">
              Update your personal and academic information.
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-md border px-3 py-2 text-sm animate-in zoom-in duration-300 ${
              status.type === "error"
                ? "bg-error/10 border-error/20 text-error"
                : "bg-green-500/10 border-green-500/20 text-green-700"
            }`}
          >
            {status.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-Only System Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-dashed border-border rounded-lg">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Fingerprint size={12} className="text-secondary" /> Profile
                UUID
              </label>
              <Input
                name="uuid"
                value={formData.uuid}
                readOnly
                className="bg-muted/50 cursor-not-allowed font-mono text-[11px] h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Hash size={12} className="text-secondary" /> CWID
              </label>
              <Input
                name="cwid"
                value={formData.cwid}
                readOnly
                className="bg-muted/50 cursor-not-allowed font-mono text-[11px] h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="first_name"
              label="First name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              name="last_name"
              label="Last name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            readOnly
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="major"
              label="Major"
              value={formData.major}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
            />
            <Input
              name="classification"
              label="Classification"
              value={formData.classification}
              onChange={handleChange}
              placeholder="e.g. Senior"
            />
          </div>

          <div className="pt-4 border-t border-border/50">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                {saving ? "Saving Changes…" : "Update Profile"}
                {!saving && <Save size={16} />}
              </span>
            </Button>
          </div>
        </form>
      </Card>
      <Card className="max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Lock size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-accent uppercase tracking-tight">
              Change Password
            </h2>
            <p className="text-sm text-text-muted">Change your password.</p>
          </div>
        </div>
        <Link
          href="/password-change"
          className="text-xs font-bold text-text-muted hover:text-primary transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Lock size={14} />
            Change Password
          </span>
        </Link>
      </Card>
    </div>
  );
}
