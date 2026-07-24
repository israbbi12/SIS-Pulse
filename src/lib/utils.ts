import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateStudentId(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `SIS-${year}-${random}`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function calculateGrade(marks: number, total: number = 100): string {
  const percentage = (marks / total) * 100
  if (percentage >= 80) return "A+"
  if (percentage >= 70) return "A"
  if (percentage >= 60) return "A-"
  if (percentage >= 50) return "B"
  if (percentage >= 40) return "C"
  return "F"
}
