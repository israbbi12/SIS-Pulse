import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const db = new GoogleDB(user.id)
    const courses = await db.getAll("Courses")
    return success(courses)
  } catch {
    return error("Something went wrong", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const db = new GoogleDB(user.id)
    const { name, code, description, duration, fee } = await req.json()
    if (!name || !code) return error("Name and code are required")

    const existing = await db.findOne("Courses", "code", code)
    if (existing) return error("Course code already exists")

    const course = await db.create("Courses", {
      name, code, description, duration,
      fee: fee ? parseFloat(fee) : null,
      active: true,
    })
    return success(course, 201)
  } catch {
    return error("Something went wrong", 500)
  }
}
