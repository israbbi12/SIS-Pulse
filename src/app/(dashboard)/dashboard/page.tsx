"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, BookOpen, ClipboardCheck, GraduationCap, TrendingUp } from "lucide-react"
import { PageLoader } from "@/components/ui/loader"

interface Stats {
  totalStudents: number
  totalAdmissions: number
  totalCourses: number
  totalBatches: number
  admittedStudents: number
  pendingApplications: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStats(json.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const cards = [
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
    { label: "Total Admissions", value: stats?.totalAdmissions ?? 0, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/20" },
    { label: "Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20" },
    { label: "Batches", value: stats?.totalBatches ?? 0, icon: GraduationCap, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/20" },
    { label: "Admitted", value: stats?.admittedStudents ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
    { label: "Pending Apps", value: stats?.pendingApplications ?? 0, icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/20" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your institution</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {stats && stats.totalStudents === 0 && (
        <Card className="border-dashed animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">Welcome to SIS-Pulse!</h3>
            <p className="text-muted-foreground text-sm max-w-md mt-2">
              Start by adding courses and batches, then process admissions. Everything you need to manage your institution is here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
