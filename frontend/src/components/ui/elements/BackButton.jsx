import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BackButton({ link, name = "Code Grader" }) {
  return (
    <nav className="cursor-pointer flex items-center gap-2 text-text-muted text-xs mb-8 mt-4 md:mt-0 mt-20 md:mt-0">
      <button className="hover:text-primary flex items-center gap-1 transition-colors">
        <ArrowLeft size={16} /> <Link href={`${link}`}> Assignment List</Link>
      </button>
      <span>/</span>
      <span className="font-bold text-xs text-accent uppercase tracking-wider">
        {name}
      </span>
    </nav>
  );
}
