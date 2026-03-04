"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMetadata } from "@/context";
import { LoadingPage } from "@/components/ui/sections";
import { BackButton, Button, Card, Input } from "@/components/ui/elements";
import {
  UserCircle,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle2,
  Fingerprint,
  Hash,
} from "lucide-react";

function getProfilePath(role, cwid) {
  if (!cwid) return null;
  if (role === "FA") return `accounts/faculty/${cwid}/`;
  if (role === "ST") return `accounts/student/${cwid}/`;
  if (role === "GA") return `accounts/ga/${cwid}/`;
  return null;
}

export default function FacultySettingsPage() {
  const { api, user } = useMetadata();
  const isFaculty = user?.role === "FA";
  const isGradingAssistant = user?.role === "GA";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    uuid: "", // New state for non-editable UUID
    first_name: "",
    last_name: "",
    email: "",
    cwid: "",
    title: "",
    phone: "",
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
          uuid: data.id ?? "", // Capturing the UUID from the profile record
          first_name: data.user?.first_name ?? "",
          last_name: data.user?.last_name ?? "",
          email: data.user?.email ?? "",
          cwid: data.user?.cwid ?? "",
          title: data.title ?? "",
          phone: data.phone ?? "",
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
      const payload = {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          cwid: formData.cwid,
        },
      };

      // Only faculty profiles support title/phone fields
      if (isFaculty) {
        payload.title = formData.title;
        payload.phone = formData.phone;
      }

      await api.patch(profilePath, payload);
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
              Profile Settings
            </h2>
            <p className="text-sm text-text-muted">
              Manage your identity and contact information.
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
          {/* Read-Only System Identifiers Section */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {isFaculty && (
              <Input
                name="phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
            )}
          </div>

          {isFaculty && (
            <Input
              name="title"
              label="Professional Title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Associate Professor"
              required
            />
          )}

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

      {/* Account actions */}
      <Card className="max-w-none border-dashed border-error/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-secondary/10 rounded-lg">
            <LogOut className="text-secondary" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-accent uppercase tracking-tight">
              Session
            </h2>
            <p className="text-sm text-text-muted">
              Securely sign out of the system.
            </p>
          </div>
        </div>
        <Link href="/logout">
          <Button
            variant="outline"
            type="button"
            className="cursor-pointer rounded px-4 py-2 text-error bg-error text-white transition-colors"
          >
            Log out
          </Button>
        </Link>
      </Card>
    </div>
  );
}
