"use client";

import { useMetadata } from "@/context";

const DisplayBody = ({ children, name, message, buttonIn }) => {
  const { user } = useMetadata();
  const isGA = user?.role === "GA";

  // For grading assistants (GA), completely hide the header button
  const renderedButton = !isGA ? buttonIn : null;

  return (
    <div className="flex bg-background ">
      <main className="flex-1 transition-all duration-300 ">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-secondary text-2xl font-bold tracking-widest uppercase">
                {name}
              </h1>
              <p className="text-text-muted italic">{message}</p>
            </div>

            {renderedButton}
          </div>
        </header>

        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
};

export default DisplayBody;
