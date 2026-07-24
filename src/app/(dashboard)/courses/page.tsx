"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loader"
import { toast } from "sonner"
import { Plus, Pencil, BookOpen } from "lucide-react"

interface Course {
  id: string
  name: string
  code: string
  description: string | null
  duration: string | null
  fee: number | null
  active: boolean
  _count: { batches: number; students: number }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState({ name: "", code: "", description: "", duration: "", fee: "" })

  async function loadCourses() {
    const res = await fetch("/api/courses")
    const json = await res.json()
    if (json.success) setCourses(json.data)
    setLoading(false)
  }

  useEffect(() => { loadCourses() }, [])

  function resetForm() {
    setForm({ name: "", code: "", description: "", duration: "", fee: "" })
    setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editing ? `/api/courses/${editing.id}` : "/api/courses"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (json.success) {
      toast.success(editing ? "Course updated" : "Course created")
      setOpen(false)
      resetForm()
      loadCourses()
    } else {
      toast.error(json.error)
    }
  }

  function startEdit(course: Course) {
    setEditing(course)
    setForm({
      name: course.name,
      code: course.code,
      description: course.description || "",
      duration: course.duration || "",
      fee: course.fee?.toString() || "",
    })
    setOpen(true)
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage academic programs</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Course" : "Add New Course"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4 Years" />
                </div>
                <div className="space-y-2">
                  <Label>Fee (BDT)</Label>
                  <Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No courses yet. Add your first course!
                  </TableCell>
                </TableRow>
              ) : courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell><Badge variant="secondary">{course.code}</Badge></TableCell>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.duration || "—"}</TableCell>
                  <TableCell>{course.fee ? `৳${course.fee.toLocaleString()}` : "—"}</TableCell>
                  <TableCell>{course._count.batches}</TableCell>
                  <TableCell>{course._count.students}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(course)}>
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
