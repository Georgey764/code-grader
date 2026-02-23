"use client";

import Link from "next/link";
import { Button } from "@/components/ui/elements";
import { Plus } from "lucide-react";

export default function HeadingWrapper({
  children,
  name = "Dashboard",
  ButtonIn = null,
}) {
  return (
    <div className="flex bg-background">
      <main className="flex-1 transition-all duration-300 ">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-secondary text-2xl font-bold tracking-widest uppercase">
                {name}
              </h1>
              <p className="text-text-muted italic">Welcome back, Chief.</p>
            </div>

            {ButtonIn}
          </div>
        </header>

        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
