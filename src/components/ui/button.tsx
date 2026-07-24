import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-label-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        filled: "bg-primary text-on-primary hover:shadow-sm active:brightness-90",
        tonal: "bg-secondary-container text-on-secondary-container hover:shadow-sm active:brightness-95",
        outlined: "border border-outline bg-transparent text-on-surface hover:bg-surface-container-high",
        outline: "border border-outline bg-transparent text-on-surface hover:bg-surface-container-high",
        text: "bg-transparent text-primary hover:bg-primary-container/40",
        elevated: "bg-surface-container-low text-on-surface shadow-sm hover:shadow-md",
        destructive: "bg-error text-on-error hover:brightness-110 active:brightness-90",
        ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 rounded-full px-4 text-label-md gap-1.5",
        default: "h-10 rounded-full px-6 text-label-lg gap-2",
        lg: "h-12 rounded-full px-8 text-label-lg gap-2",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
