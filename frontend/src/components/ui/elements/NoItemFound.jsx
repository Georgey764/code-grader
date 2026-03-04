export default function NoItemFound({ name = "courses" }) {
  return (
    <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
      <p className="text-text-muted">
        No <span>{name}</span> found
      </p>
    </div>
  );
}
