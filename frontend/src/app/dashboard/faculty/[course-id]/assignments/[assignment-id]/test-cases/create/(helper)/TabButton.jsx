export default function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-white shadow-sm text-primary"
          : "text-text-muted hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}
