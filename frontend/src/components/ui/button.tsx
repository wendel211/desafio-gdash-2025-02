import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    let base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
    let styles =
      variant === "outline"
        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        : "bg-blue-600 text-white hover:bg-blue-700";

    return (
      <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />
    );
  }
);

Button.displayName = "Button";
