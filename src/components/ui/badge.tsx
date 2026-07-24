import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary-container text-on-primary-container",
      secondary: "bg-surface-container-high text-on-surface-variant",
      destructive: "bg-error-container text-on-error-container",
      outline: "border border-outline text-on-surface-variant",
      success: "bg-tertiary-container text-on-tertiary-container",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    }
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-0.5 text-label-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
