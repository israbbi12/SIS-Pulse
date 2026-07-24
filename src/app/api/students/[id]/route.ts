import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    include: { course: true, batch: true, results: { include: { batch: true } } },
  })
  if (!student) return error("Not found", 404)
  return success(student)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await req.json()
    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
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
      },
      include: { course: true, batch: true },
    })
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
    const { id } = await params
    await prisma.student.delete({ where: { id } })
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
