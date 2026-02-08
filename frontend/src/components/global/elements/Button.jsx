// Button.jsx
const Button = ({ children, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-primary text-white hover:brightness-110",
    secondary: "bg-secondary text-accent hover:brightness-105",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };

  return (
    <button
      className={`w-full py-2 px-4 rounded-md font-weight-bold transition-all duration-200 ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
