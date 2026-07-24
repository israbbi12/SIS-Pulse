"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PageLoader } from "@/components/ui/loader"
import { Search, Users, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  phone: string | null
  course: { id: string; name: string; code: string } | null
  batch: { id: string; name: string } | null
  status: string
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetch("/api/students?status=ADMITTED")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStudents(json.data)
        setLoading(false)
      })
  }, [])

  const filtered = students.filter((s) =>
    !search || s.firstName.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground">All admitted students</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-60" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No students found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                  <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.course?.code || "—"}</TableCell>
                  <TableCell>{s.batch?.name || "—"}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell><Badge variant="success">Admitted</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/students/${s.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
