"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loader"
import { toast } from "sonner"
import { Plus, Trash2, ClipboardCheck } from "lucide-react"

interface Result {
  id: string
  studentId: string
  batchId: string
  subject: string
  marks: number
  totalMarks: number
  grade: string
  semester: string | null
  student: { firstName: string; lastName: string; studentId: string }
  batch: { name: string; course: { name: string } }
}

interface Student {
  id: string
  firstName: string
  lastName: string
  studentId: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ studentId: "", batchId: "", subject: "", marks: "", totalMarks: "100", semester: "" })

  async function loadData() {
    const [rRes, sRes] = await Promise.all([
      fetch("/api/results"),
      fetch("/api/students"),
    ])
    const rJson = await rRes.json()
    const sJson = await sRes.json()
    if (rJson.success) setResults(rJson.data)
    if (sJson.success) setStudents(sJson.data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (json.success) {
      toast.success("Result added")
      setOpen(false)
      setForm({ studentId: "", batchId: "", subject: "", marks: "", totalMarks: "100", semester: "" })
      loadData()
    } else {
      toast.error(json.error)
    }
  }

  async function deleteResult(id: string) {
    const res = await fetch(`/api/results/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.success) {
      toast.success("Result deleted")
      loadData()
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">Student grades and marks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Result</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marks Obtained</Label>
                  <Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="e.g. Semester 1" />
              </div>
              <Button type="submit" className="w-full">Add Result</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No results yet.
                  </TableCell>
                </TableRow>
              ) : results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.student.firstName} {r.student.lastName}</TableCell>
                  <TableCell className="font-mono text-xs">{r.student.studentId}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell>{r.marks}/{r.totalMarks}</TableCell>
                  <TableCell>
                    <Badge variant={
                      r.grade === "A+" || r.grade === "A" ? "success" :
                      r.grade === "F" ? "destructive" : "warning"
                    }>{r.grade}</Badge>
                  </TableCell>
                  <TableCell>{r.semester || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteResult(r.id)}>
                      <Trash2 className="h-4 w-4" />
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
