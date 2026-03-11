// Input.jsx
const inputBaseClasses =
  "w-full px-3 py-2 bg-white border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all";

const Input = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-text-main ml-1">{label}</label>
    <input
      className={
        className ? `${inputBaseClasses} ${className}` : inputBaseClasses
      }
      {...props}
    />
  </div>
);

export default Input;
