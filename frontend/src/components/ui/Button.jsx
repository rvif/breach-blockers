export default function Button({
  children,
  variant = "primary",
  isLoading,
  ...props
}) {
  const baseStyles =
    "px-4 py-2 rounded font-mono transition-all duration-200 disabled:opacity-50";

  const variants = {
    primary: "bg-cyber-green text-cyber-black hover:bg-opacity-90",
    secondary:
      "border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-black",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
