import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { id } = await params
    const db = new GoogleDB(user.id)
    const student = await db.getById("Students", id)
    if (!student) return error("Not found", 404)

    const results = await db.findWhere("Results", "studentId", id)

    return success({ ...student, results })
  } catch {
    return error("Something went wrong", 500)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { id } = await params
    const db = new GoogleDB(user.id)
    const data = await req.json()
    const student = await db.update("Students", id, {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      address: data.address,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      photo: data.photo,
      courseId: data.courseId,
      batchId: data.batchId,
      status: data.status,
    })
    if (!student) return error("Not found", 404)
    return success(student)
  } catch {
    return error("Something went wrong", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { id } = await params
    const db = new GoogleDB(user.id)
    const deleted = await db.delete("Students", id)
    if (!deleted) return error("Not found", 404)
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
