"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageLoader } from "@/components/ui/loader"
import { toast } from "sonner"
import { Plus, Eye, FileText, CheckCircle, XCircle, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  gender: string | null
  course: { id: string; name: string; code: string } | null
  batch: { id: string; name: string } | null
  status: string
  createdAt: string
}

interface Course {
  id: string
  name: string
  code: string
}

export default function AdmissionsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "",
    phone: "", email: "", address: "", guardianName: "", guardianPhone: "",
    courseId: "", batchId: "",
  })
  const [batches, setBatches] = useState<any[]>([])
  const router = useRouter()

  async function loadData() {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/students"),
      fetch("/api/courses"),
    ])
    const sJson = await sRes.json()
    const cJson = await cRes.json()
    if (sJson.success) setStudents(sJson.data)
    if (cJson.success) setCourses(cJson.data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function loadBatches(courseId: string) {
    if (!courseId) return
    const res = await fetch(`/api/batches`)
    const json = await res.json()
    if (json.success) {
      setBatches(json.data.filter((b: any) => b.courseId === courseId && b.active))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "APPLIED" }),
    })
    const json = await res.json()
    if (json.success) {
      toast.success("Application submitted successfully")
      setOpen(false)
      setForm({ firstName: "", lastName: "", dateOfBirth: "", gender: "", phone: "", email: "", address: "", guardianName: "", guardianPhone: "", courseId: "", batchId: "" })
      loadData()
    } else {
      toast.error(json.error)
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const json = await res.json()
    if (json.success) {
      toast.success(`Application ${status.toLowerCase()}`)
      loadData()
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground">Manage student applications</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 w-60" placeholder="Search applications..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Application</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Admission Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Guardian Name</Label>
                    <Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Guardian Phone</Label>
                    <Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course *</Label>
                    <Select value={form.courseId} onValueChange={(v) => { setForm({ ...form, courseId: v, batchId: "" }); loadBatches(v) }}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select value={form.batchId} onValueChange={(v) => setForm({ ...form, batchId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        {batches.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Submit Application</Button>
              </form>
            </DialogContent>
          </Dialog>
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
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                  <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.course?.code || "—"}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      s.status === "ADMITTED" ? "success" :
                      s.status === "REJECTED" ? "destructive" : "warning"
                    }>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/students/${s.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {s.status === "APPLIED" && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-600" onClick={() => updateStatus(s.id, "ADMITTED")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => updateStatus(s.id, "REJECTED")}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
