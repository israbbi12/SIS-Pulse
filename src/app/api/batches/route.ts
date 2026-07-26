import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const db = new GoogleDB(user.id)
    const batches = await db.getAll("Batches")
    return success(batches)
  } catch {
    return error("Something went wrong", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const db = new GoogleDB(user.id)
    const { name, courseId, startDate, endDate } = await req.json()
    if (!name || !courseId) return error("Name and course are required")
    const batch = await db.create("Batches", { name, courseId, startDate, endDate, active: true })
    return success(batch, 201)
  } catch {
    return error("Something went wrong", 500)
  }
}
