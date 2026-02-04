export default function Layout({ children }) {
  return (
    <>
      <aside className="w-[200px] h-[full] p-4 fixed top-0 left-0">
        <div>Code Grader</div>
        <div className="flex flex-col items-start justify-start">
          <button>Dashboard</button>
          <button>Grades</button>
          <button>Group</button>
        </div>
      </aside>
      <div className="ml-[200px] w-[calc(100vw-200px)] min-h-screen p-4">
        {children}
      </div>
    </>
  );
}
