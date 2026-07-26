"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loader"
import { toast } from "sonner"
import { Cloud, CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react"

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const googleStatus = searchParams.get("google")
    if (googleStatus === "connected") {
      toast.success("Google Drive connected successfully!")
    } else if (googleStatus === "error") {
      toast.error("Failed to connect Google Drive")
    }

    fetch("/api/auth/google/status")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStatus(json.data)
        setLoading(false)
      })
  }, [searchParams])

  async function connectGoogle() {
    setConnecting(true)
    try {
      const res = await fetch("/api/auth/google/url")
      const json = await res.json()
      if (json.success) {
        window.location.href = json.data.url
      } else {
        toast.error(json.error)
        setConnecting(false)
      }
    } catch {
      toast.error("Something went wrong")
      setConnecting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse-glow">
              <Cloud className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Connect Google Drive</CardTitle>
          <CardDescription>
            SIS-Pulse uses Google Sheets as its database. Connect your Google Drive to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Google Drive Connection</span>
              {status?.connected ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
            {status?.googleEmail && (
              <div className="text-sm text-muted-foreground">
                Connected as: <span className="font-medium">{status.googleEmail}</span>
              </div>
            )}
            {status?.hasSpreadsheet && (
              <div className="text-sm text-muted-foreground">
                Database: <span className="font-medium">SIS-Pulse Database ✓</span>
              </div>
            )}
          </div>

          {!status?.connected ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You&apos;ll be redirected to Google to authorize SIS-Pulse to create and manage a spreadsheet in your Drive.
              </p>
              <Button onClick={connectGoogle} disabled={connecting} className="w-full" size="lg">
                {connecting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                Connect Google Drive
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Your data stays in your Google Drive. We only access the spreadsheet we create.</p>
            <p>After connecting, all students, courses, and results data will be stored in your Google Sheets.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SetupContent />
    </Suspense>
  )
}
