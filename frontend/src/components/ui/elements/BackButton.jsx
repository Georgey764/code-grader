"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function BackButton({
  back_name = "Go Back",
  name = "Code Grader",
}) {
  const pathname = usePathname();
  const link = useMemo(() => {
    if (pathname.split("/").length <= 3) {
      return null;
    }
    return pathname + "/../";
  }, [pathname]);

  return (
    <>
      {link && (
        <nav className="cursor-pointer flex items-center gap-2 text-text-muted text-xs mb-8 mt-4 md:mt-0 mt-20 md:mt-0">
          <button className="hover:text-primary flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> <Link href={`${link}`}> {back_name}</Link>
          </button>
          <span>/</span>
          <span className="font-bold text-xs text-accent uppercase tracking-wider">
            {name}
          </span>
        </nav>
      )}
    </>
  );
}
