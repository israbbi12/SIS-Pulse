"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createContext, useContext } from "react"
import { PageLoader } from "@/components/ui/loader"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.data)
        else router.push("/login")
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [pathname, router])

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      setUser(null)
      router.push("/login")
    })
  }

  if (loading) return <PageLoader />

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}
