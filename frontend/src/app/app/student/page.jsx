export default function Page() {
  return (
    <div className="flex bg-background">
      <main className="flex-1 transition-all duration-300 ">
        <header className="mb-8">
          <h1 className="text-secondary text-2xl font-bold tracking-widest uppercase mt-12 md:mt-0">
            Dashboard
          </h1>
          <div className="h-[1.5px] bg-border w-full mt-3 opacity-50" />
        </header>
        <section className="space-y-4">
          <p className="text-text-muted italic">Welcome back, Warhawk.</p>
        </section>
      </main>
    </div>
  );
}
