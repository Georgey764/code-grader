const Card = ({ children, className = "" }) => (
  <div
    className={`bg-surface p-8 rounded-md shadow-subtle border border-border w-full ${className || "max-w-md"}`.trim()}
  >
    {children}
  </div>
);

export default Card;
