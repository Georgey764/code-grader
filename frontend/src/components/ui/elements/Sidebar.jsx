"use client"; // Required for useState in Next.js
import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/context";

const Sidebar = ({ navItems }) => {
  const { name } = useMetadata();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON - Only visible on small screens */}
      <div className="drop-shadow shadow-lg md:hidden fixed top-0 left-0 z-[55] bg-primary w-full h-[80px]">
        <p className="fixed top-[calc(40px-1.5rem)] left-[1rem] text-white font-mono text-[2rem]">
          {name}
        </p>
      </div>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-[60] p-2 bg-primary text-white rounded-md shadow-lg drop-shadow"
      >
        <Menu size={24} />
      </button>

      {/* BACKDROP - Dims the screen when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside
        className={`
        fixed top-0 left-0 h-screen bg-primary text-white z-[70] transition-transform duration-300 ease-in-out
        w-64 md:w-20 lg:w-64 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full py-6">
          {/* Sidebar Header / Close Button */}
          <div className="flex items-center justify-between px-6 mb-10">
            <span className="font-bold tracking-tighter text-xl lg:block md:hidden">
              {name}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-white/70"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 px-3">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.route)}
                className="cursor-pointer flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 hover:text-secondary transition-all group"
              >
                <div className="min-w-[24px]">{item.icon}</div>
                <span className="font-medium text-sm lg:block md:hidden truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Bottom Branding (Optional) */}
          <div className="mt-auto px-6 text-[10px] text-white/40 uppercase tracking-widest lg:block md:hidden">
            Warhawk Systems © 2026
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
