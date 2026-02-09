import React from "react";
import { useMetadata } from "@/hooks";
export default function HomePage() {
  const { name } = useMetadata();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border bg-surface px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="font-bold text-accent tracking-tight">{name}</span>
        </div>
        <a
          href="/login"
          className="text-sm font-bold text-primary hover:text-secondary transition-colors"
        >
          Faculty & Student Login →
        </a>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center space-y-6">
          <p className="text-subheading">ULM Computer Science</p>
          <h1 className="text-h1">
            Streamline your code, <br />
            elevate your grade.
          </h1>
          <p className="text-body max-w-2xl mx-auto">
            The official{" "}
            <span className="font-semibold text-primary">
              Warhawk Code Grader
            </span>{" "}
            provides real-time feedback for students and powerful automated
            assessment tools for faculty.
          </p>

          <div className="pt-6">
            <a
              href="/login"
              className="inline-block px-12 py-4 bg-primary text-white font-bold rounded-md shadow-subtle hover:scale-105 transition-transform"
            >
              Access Portal
            </a>
          </div>
        </div>

        {/* Focus Sections: Students vs Faculty */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full mt-16">
          {/* Student Card */}
          <div className="bg-surface p-8 rounded-md border-l-4 border-secondary shadow-subtle">
            <h2 className="text-h2 mb-4">For Students</h2>
            <ul className="space-y-3 text-body">
              <li className="flex items-start gap-2">
                <span className="text-secondary">✔</span>
                <span>Instant feedback on syntax and logic errors.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary">✔</span>
                <span>Track assignment deadlines and submission history.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary">✔</span>
                {/* <span>
                  Standardize your workflow with{" "}
                  <code className="code-main">ulm-cli</code>.
                </span> */}
              </li>
            </ul>
          </div>

          {/* Faculty Card */}
          <div className="bg-surface p-8 rounded-md border-l-4 border-primary shadow-subtle">
            <h2 className="text-h2 mb-4">For Faculty</h2>
            <ul className="space-y-3 text-body">
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>Automate grading with custom test suites.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>Detect plagiarism and code similarities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>Detailed analytics on class-wide performance.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-accent text-white py-10 px-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-secondary">
              The University of Louisiana Monroe
            </p>
            <p className="text-sm opacity-70 text-gray-300">
              700 University Ave, Monroe, LA 71209
            </p>
          </div>
          <p className="text-caption text-gray-400 italic">
            Developed & Maintained by The Devs
          </p>
        </div>
      </footer>
    </div>
  );
}
