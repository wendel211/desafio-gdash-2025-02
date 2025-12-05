import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        className={`flex h-10 w-full rounded-md border px-3 text-sm shadow-sm focus:outline-none ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
