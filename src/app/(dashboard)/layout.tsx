"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Layers,
  ClipboardCheck,
  LogOut,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { PageLoader } from "@/components/ui/loader"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admissions", label: "Admissions", icon: FileText },
  { href: "/students", label: "Students", icon: Users },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/batches", label: "Batches", icon: Layers },
  { href: "/results", label: "Results", icon: ClipboardCheck },
]

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <div key={item.href} className="group relative flex justify-center">
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                collapsed ? "justify-center w-10 h-10 p-0" : "w-full",
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && item.label}
            </Link>
            {collapsed && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-inverse-surface text-inverse-on-surface text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-lg">
                {item.label}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!user) return <PageLoader />

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-surface-container-low text-on-surface flex flex-col transition-all duration-300 ease-out",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className={cn("flex items-center h-16", sidebarOpen ? "gap-3 px-6" : "justify-center px-2")}>
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-sm shrink-0">
            S
          </div>
          {sidebarOpen && (
            <>
              <div>
                <p className="font-semibold text-sm text-on-surface">SIS-Pulse</p>
                <p className="text-xs text-on-surface-variant">Admin Panel</p>
              </div>
            </>
          )}
        </div>

        <Sidebar collapsed={!sidebarOpen} />

        <div className={cn("p-3", sidebarOpen ? "" : "flex justify-center")}>
          <div className={cn("flex items-center gap-3", sidebarOpen ? "px-3 py-2" : "justify-center")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary-container text-on-primary-container">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-on-surface">{user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate capitalize">{user.role?.toLowerCase()}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface shrink-0" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className={cn("flex flex-col min-h-screen transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <Button variant="ghost" size="icon" className={cn("fixed top-3 z-40 text-on-surface-variant transition-all duration-300", sidebarOpen ? "left-[264px]" : "left-[72px]")} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="fixed top-3 right-4 z-40">
          <ThemeToggle />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <div className="h-14" />
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 lg:p-6 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
