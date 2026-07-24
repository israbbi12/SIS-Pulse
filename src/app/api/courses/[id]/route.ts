import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: { batches: { where: { active: true } } },
  })
  if (!course) return error("Not found", 404)
  return success(course)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, code, description, duration, fee, active } = await req.json()
    const course = await prisma.course.update({
      where: { id },
      data: { name, code, description, duration, fee: fee ? parseFloat(fee) : null, active },
    })
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
    const { id } = await params
    await prisma.course.update({
      where: { id },
      data: { active: false },
    })
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
