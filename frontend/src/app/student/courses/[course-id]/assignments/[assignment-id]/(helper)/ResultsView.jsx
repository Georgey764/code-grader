export default function Page({ results, children = null }) {
  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="bg-surface p-8 rounded-lg border-l-8 border-primary shadow-subtle">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-h2 border-none">Test Execution Summary</h2>
          {/* {<span className="text-h1 text-secondary">75%</span>} */}
          {children}
        </div>

        <div className="space-y-4">
          {results.map((test, index) => {
            return (
              !test?.test_case?.is_hidden && (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background border border-border rounded-md"
                >
                  <div>
                    <h4 className="font-bold text-text-main">
                      Test Case {index + 1}
                    </h4>
                    {test?.stdout && (
                      <p className="text-error text-sm font-mono mt-1">
                        Output: {test?.stdout}
                      </p>
                    )}
                    {test?.stderr && (
                      <p className="text-error text-sm font-mono mt-1">
                        {test?.stderr}
                      </p>
                    )}
                  </div>
                  <span
                    className={`mt-2 md:mt-0 px-4 py-1 rounded-full text-xs font-bold uppercase ${test?.is_success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {test?.exit_code ? "Failed" : "Success"}
                  </span>
                </div>
              )
            );
          })}
        </div>
      </div>
    </section>
  );
}
