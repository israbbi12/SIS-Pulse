"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageLoader } from "@/components/ui/loader"
import { toast } from "sonner"
import { ArrowLeft, Download, FileText, CreditCard } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: string | null
  phone: string | null
  email: string | null
  address: string | null
  guardianName: string | null
  guardianPhone: string | null
  photo: string | null
  course: { id: string; name: string; code: string } | null
  batch: { id: string; name: string } | null
  status: string
  results: any[]
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStudent(json.data)
          setForm(json.data)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (json.success) {
      setStudent(json.data)
      setEditing(false)
      toast.success("Student updated")
    } else {
      toast.error(json.error)
    }
  }

  function downloadPDF(type: string) {
    window.open(`/api/pdf/${type}?studentId=${id}`, "_blank")
  }

  if (loading) return <PageLoader />
  if (!student) return <p>Student not found</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground">{student.studentId}</p>
        </div>
        <Badge variant={
          student.status === "ADMITTED" ? "success" :
          student.status === "REJECTED" ? "destructive" : "warning"
        } className="text-sm px-3 py-1">
          {student.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{student.firstName} {student.lastName}</span>
              <span className="text-muted-foreground">Date of Birth</span>
              <span>{formatDate(student.dateOfBirth)}</span>
              <span className="text-muted-foreground">Gender</span>
              <span className="capitalize">{student.gender?.toLowerCase() || "—"}</span>
              <span className="text-muted-foreground">Phone</span>
              <span>{student.phone || "—"}</span>
              <span className="text-muted-foreground">Email</span>
              <span>{student.email || "—"}</span>
              <span className="text-muted-foreground">Address</span>
              <span>{student.address || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Academic Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Student ID</span>
              <span className="font-medium font-mono">{student.studentId}</span>
              <span className="text-muted-foreground">Course</span>
              <span>{student.course?.name || "—"}</span>
              <span className="text-muted-foreground">Batch</span>
              <span>{student.batch?.name || "—"}</span>
              <span className="text-muted-foreground">Admission Date</span>
              <span>{formatDate(student.dateOfBirth)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Guardian Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Guardian Name</span>
              <span>{student.guardianName || "—"}</span>
              <span className="text-muted-foreground">Guardian Phone</span>
              <span>{student.guardianPhone || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => downloadPDF("testimonial")}>
              <FileText className="h-4 w-4 mr-2" /> Download Testimonial
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => downloadPDF("idcard")}>
              <CreditCard className="h-4 w-4 mr-2" /> Download ID Card
            </Button>
          </CardContent>
        </Card>
      </div>

      {student.results.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Marks</th>
                  <th className="text-left py-2">Grade</th>
                  <th className="text-left py-2">Semester</th>
                </tr>
              </thead>
              <tbody>
                {student.results.map((r: any) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{r.subject}</td>
                    <td className="py-2">{r.marks}/{r.totalMarks}</td>
                    <td className="py-2 font-medium">{r.grade}</td>
                    <td className="py-2">{r.semester || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {editing && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Edit Student</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPLIED">Applied</SelectItem>
                    <SelectItem value="ADMITTED">Admitted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!editing && (
        <Button variant="outline" onClick={() => setEditing(true)}>Edit Information</Button>
      )}
    </div>
  )
}
