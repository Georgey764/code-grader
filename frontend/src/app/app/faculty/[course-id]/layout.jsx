"use client";

import React, { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Info,
  Users,
  GraduationCap,
  FileCode,
  ChevronDown,
  Menu,
} from "lucide-react";

export default function Layout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const courseId = params["course-id"];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Home",
      icon: <Info size={16} />,
      href: `/app/faculty/${courseId}`,
    },
    {
      label: "Assignments",
      icon: <FileCode size={16} />,
      href: `/app/faculty/${courseId}/assignments`,
    },
    {
      label: "Roster",
      icon: <Users size={16} />,
      href: `/app/faculty/${courseId}/roster`,
    },
    {
      label: "Grades",
      icon: <GraduationCap size={16} />,
      href: `/app/faculty/${courseId}/grades`,
    },
  ];

  const handleNav = (href) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* 1. SKINNY DESKTOP NAVIGATION (Canvas Sidebar Style) */}
      <aside className="hidden lg:block w-48 shrink-0">
        <nav className="sticky top-10 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all group ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-text-muted hover:bg-slate-100 hover:text-accent"
                }`}
              >
                <span
                  className={`${isActive ? "text-white" : "text-text-muted group-hover:text-accent opacity-70"}`}
                >
                  {item.icon}
                </span>
                <span className={isActive ? "font-black" : "font-semibold"}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. MOBILE HAMBURGER ACCORDION */}
      <div className="lg:hidden w-full">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-3 bg-surface border border-border rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Menu size={18} className="text-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-accent">
              Course Menu
            </span>
          </div>
          <ChevronDown
            className={`transition-transform duration-300 text-text-muted ${isMobileMenuOpen ? "rotate-180" : ""}`}
            size={18}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-surface border border-border rounded-lg p-1.5 shadow-inner space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-text-muted hover:bg-slate-50 rounded-md"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
