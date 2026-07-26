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
    const course = await db.getById("Courses", id)
    if (!course) return error("Not found", 404)
    return success(course)
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
    const course = await db.update("Courses", id, {
      name: data.name, code: data.code, description: data.description,
      duration: data.duration, fee: data.fee ? parseFloat(data.fee) : null, active: data.active,
    })
    if (!course) return error("Not found", 404)
    return success(course)
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
    const deleted = await db.update("Courses", id, { active: false })
    if (!deleted) return error("Not found", 404)
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
