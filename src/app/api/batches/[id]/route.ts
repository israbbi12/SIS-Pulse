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
    const batch = await db.getById("Batches", id)
    if (!batch) return error("Not found", 404)
    return success(batch)
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
    const batch = await db.update("Batches", id, {
      name: data.name, courseId: data.courseId,
      startDate: data.startDate, endDate: data.endDate, active: data.active,
    })
    if (!batch) return error("Not found", 404)
    return success(batch)
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
    const deleted = await db.update("Batches", id, { active: false })
    if (!deleted) return error("Not found", 404)
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
