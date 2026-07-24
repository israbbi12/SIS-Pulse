"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loader"
import { toast } from "sonner"
import { Plus, Pencil, Layers } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Batch {
  id: string
  name: string
  courseId: string
  course: { id: string; name: string; code: string }
  startDate: string | null
  endDate: string | null
  active: boolean
  _count: { students: number }
}

interface Course {
  id: string
  name: string
  code: string
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Batch | null>(null)
  const [form, setForm] = useState({ name: "", courseId: "", startDate: "", endDate: "" })

  async function loadData() {
    const [bRes, cRes] = await Promise.all([
      fetch("/api/batches"),
      fetch("/api/courses"),
    ])
    const bJson = await bRes.json()
    const cJson = await cRes.json()
    if (bJson.success) setBatches(bJson.data)
    if (cJson.success) setCourses(cJson.data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function resetForm() {
    setForm({ name: "", courseId: "", startDate: "", endDate: "" })
    setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editing ? `/api/batches/${editing.id}` : "/api/batches"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (json.success) {
      toast.success(editing ? "Batch updated" : "Batch created")
      setOpen(false)
      resetForm()
      loadData()
    } else {
      toast.error(json.error)
    }
  }

  function startEdit(batch: Batch) {
    setEditing(batch)
    setForm({
      name: batch.name,
      courseId: batch.courseId,
      startDate: batch.startDate ? batch.startDate.split("T")[0] : "",
      endDate: batch.endDate ? batch.endDate.split("T")[0] : "",
    })
    setOpen(true)
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">Manage course batches/semesters</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Batch" : "Add New Batch"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No batches yet.
                  </TableCell>
                </TableRow>
              ) : batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell><Badge variant="secondary">{batch.course.code}</Badge></TableCell>
                  <TableCell>{formatDate(batch.startDate)}</TableCell>
                  <TableCell>{formatDate(batch.endDate)}</TableCell>
                  <TableCell>{batch._count.students}</TableCell>
                  <TableCell><Badge variant={batch.active ? "success" : "secondary"}>{batch.active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(batch)}>
                      <Pencil className="h-4 w-4" />
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
