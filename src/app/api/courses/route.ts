import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { batches: true, students: true } } },
  })
  return success(courses)
}

export async function POST(req: NextRequest) {
  try {
    const { name, code, description, duration, fee } = await req.json()
    if (!name || !code) return error("Name and code are required")

    const existing = await prisma.course.findUnique({ where: { code } })
    if (existing) return error("Course code already exists")

    const course = await prisma.course.create({
      data: { name, code, description, duration, fee: fee ? parseFloat(fee) : null },
    })
    return success(course, 201)
  } catch {
    return error("Something went wrong", 500)
  }
}
