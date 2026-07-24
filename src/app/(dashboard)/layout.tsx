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
  X,
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

function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <PageLoader />

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-low text-on-surface flex flex-col transition-transform duration-300 ease-out shadow-xl rounded-r-2xl border-r border-outline-variant",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-outline-variant">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-sm m3-elevation-1">
            S
          </div>
          <div>
            <p className="font-semibold text-sm text-on-surface">SIS-Pulse</p>
            <p className="text-xs text-on-surface-variant">Admin Panel</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto text-on-surface-variant" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Sidebar onNavClick={() => setSidebarOpen(false)} />

        <div className="p-3 border-t border-outline-variant">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary-container text-on-primary-container">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-on-surface">{user.name}</p>
              <p className="text-xs text-on-surface-variant truncate capitalize">{user.role?.toLowerCase()}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-outline-variant bg-surface-container-lowest flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="text-on-surface-variant" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="flex items-center gap-3 pl-2 border-l border-outline-variant">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary-container text-on-primary-container">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-on-surface">{user.name}</p>
              <p className="text-xs text-on-surface-variant capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
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
