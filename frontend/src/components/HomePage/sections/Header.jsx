export default function Header({ name, user }) {
  return (
    <nav className="border-b border-border bg-surface px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold">
          W
        </div>
        <span className="font-bold text-accent tracking-tight">{name}</span>
      </div>

      {user ? (
        <a
          href="/login"
          className="text-sm font-bold text-primary hover:text-secondary transition-colors"
        >
          Go to Dashboard →
        </a>
      ) : (
        <a
          href="/login"
          className="text-sm font-bold text-primary hover:text-secondary transition-colors"
        >
          Faculty & Student Login →
        </a>
      )}
    </nav>
  );
}
