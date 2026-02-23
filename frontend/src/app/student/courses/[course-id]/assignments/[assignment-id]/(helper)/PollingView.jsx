export default function Page({ status, progress }) {
  return (
    <section className="bg-surface p-12 rounded-lg border border-border shadow-subtle text-center">
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-secondary transition-all duration-500 ease-out"
          style={{
            width: `${status === "uploading" ? "30%" : progress}%`,
          }}
        ></div>
      </div>
      <h2 className="text-h2 border-none">
        {status === "uploading"
          ? "Uploading File..."
          : "Grading in Progress..."}
      </h2>
      <p className="text-body mt-4 text-text-muted animate-pulse">
        Please do not refresh the page. Your code is being run against our test
        suite.
      </p>
    </section>
  );
}
