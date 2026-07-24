"use client"

export function PulseLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }
  return (
    <div className="flex items-center gap-1">
      <span className={`${sizes[size]} rounded-full bg-current animate-pulse`} />
      <span className={`${sizes[size]} rounded-full bg-current animate-pulse`} style={{ animationDelay: "0.2s" }} />
      <span className={`${sizes[size]} rounded-full bg-current animate-pulse`} style={{ animationDelay: "0.4s" }} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <PulseLoader size="lg" />
    </div>
  )
}
