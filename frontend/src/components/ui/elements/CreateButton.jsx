"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Cleanly builds the href by joining segments and removing trailing/leading slashes.
 */
function buildHref(pathname, childLink, fallbackLink) {
  if (!childLink) return fallbackLink ?? "/";

  const base = pathname.replace(/\/+$/, ""); // Remove trailing slashes
  const segment = childLink.replace(/^\/+/, ""); // Remove leading slashes

  return segment ? `${base}/${segment}` : base;
}

const CreateButton = ({
  message = "Create",
  link = "/",
  childLink = null,
  className = "",
  "aria-label": ariaLabel,
  size = "default",
}) => {
  const pathname = usePathname();
  const href = buildHref(pathname, childLink, link);

  // Size mapping aligned with the Warhawk layout rhythm
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[10px] gap-1.5 rounded-sm",
    default: "px-5 py-2.5 text-[11px] gap-2 rounded-md",
    lg: "px-8 py-4 text-xs gap-3 rounded-lg",
  };

  const baseClasses =
    "group inline-flex items-center justify-center cursor-pointer overflow-hidden " +
    "font-black uppercase tracking-[0.2em] transition-all duration-300 " +
    "bg-primary text-white border border-primary " +
    "shadow-[0_4px_0_0_rgba(75,0,24,1)] " + // Deep Maroon hard shadow for a 3D feel
    "hover:bg-accent hover:border-accent hover:shadow-[0_2px_0_0_rgba(35,31,32,1)] " +
    "hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-none " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`.trim()}
      aria-label={ariaLabel ?? message}
    >
      {/* Icon with a subtle "plus" rotation effect on hover */}
      <Plus
        className="w-4 h-4 shrink-0 transition-transform duration-500 group-hover:rotate-90 text-secondary"
        strokeWidth={3}
      />

      <span className="relative">
        {message}
        {/* Subtle underline that expands on hover */}
        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  );
};

export default CreateButton;
