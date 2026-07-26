import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const courseId = searchParams.get("courseId")
    const batchId = searchParams.get("batchId")
    const search = searchParams.get("search")

    const db = new GoogleDB(user.id)
    let students = await db.getAll("Students")

    if (status) students = students.filter((s: any) => s.status === status)
    if (courseId) students = students.filter((s: any) => s.courseId === courseId)
    if (batchId) students = students.filter((s: any) => s.batchId === batchId)
    if (search) {
      const q = search.toLowerCase()
      students = students.filter((s: any) =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      )
    }

    return success(students)
  } catch {
    return error("Something went wrong", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const db = new GoogleDB(user.id)
    const data = await req.json()
    const studentId = data.studentId || `SIS-${Date.now()}`

    const student = await db.create("Students", {
      studentId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      address: data.address,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      courseId: data.courseId,
      batchId: data.batchId,
      status: data.status || "APPLIED",
      admissionDate: new Date().toISOString(),
    })

    return success(student, 201)
  } catch {
    return error("Something went wrong", 500)
  }
}
