import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET() {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: true,
      _count: { select: { students: true } },
    },
  })
  return success(batches)
}

export async function POST(req: NextRequest) {
  try {
    const { name, courseId, startDate, endDate } = await req.json()
    if (!name || !courseId) return error("Name and course are required")

    const batch = await prisma.batch.create({
      data: {
        name,
        courseId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { course: true },
    })
    return success(batch, 201)
  } catch {
    return error("Something went wrong", 500)
  }
}
