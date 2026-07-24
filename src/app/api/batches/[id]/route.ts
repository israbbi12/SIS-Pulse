import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: { course: true, students: true },
  })
  if (!batch) return error("Not found", 404)
  return success(batch)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, courseId, startDate, endDate, active } = await req.json()
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        name, courseId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active,
      },
      include: { course: true },
    })
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
    const { id } = await params
    await prisma.batch.update({
      where: { id },
      data: { active: false },
    })
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
