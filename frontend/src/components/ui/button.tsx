import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    

    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
      destructive: "bg-red-500 text-white hover:bg-red-600/90",
      outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50",
      ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
      link: "text-blue-600 underline-offset-4 hover:underline",
    }

    // Configuração dos Tamanhos
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-9 w-9",
    }

    const variantClasses = variants[variant] || variants.default
    const sizeClasses = sizes[size] || sizes.default

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"