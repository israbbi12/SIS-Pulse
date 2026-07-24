"use client"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-background">
      <p className="text-body-md text-on-surface-variant text-center">Something went wrong</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}