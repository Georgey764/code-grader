function Button({ children }) {
  return (
    <a
      href="/login"
      className="inline-block px-12 py-4 bg-primary text-white font-bold rounded-md shadow-subtle hover:scale-105 transition-transform"
    >
      {children}
    </a>
  );
}

export default function Hero({ user }) {
  return (
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
          {user ? (
            <Button>Go to Dashboard</Button>
          ) : (
            <Button>Access Portal</Button>
          )}
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
  );
}
