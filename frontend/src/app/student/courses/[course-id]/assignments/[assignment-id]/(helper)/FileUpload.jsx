export default function Page({ handleUpload, file, setFile, children }) {
  return (
    <section className="bg-surface p-10 rounded-lg border border-border shadow-subtle transition-all">
      <div className="mb-6 flex flex-row items-center justify-between">
        <p className="text-h2 border-none">Submit Your Code</p>
        <p>{children}</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-secondary/40 rounded-lg cursor-pointer bg-background hover:bg-slate-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-sm text-text-muted">
                <span className="font-bold text-primary">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-text-muted mt-1">
                {file ? file.name : "No file selected"}
              </p>
            </div>
            <input
              type="file"
              accept=".py"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={!file}
          className="w-full bg-primary text-white font-bold py-4 rounded-md shadow-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
        >
          Submit for Grading
        </button>
      </form>
    </section>
  );
}
