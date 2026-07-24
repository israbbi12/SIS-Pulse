import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const courseId = searchParams.get("courseId")
  const batchId = searchParams.get("batchId")
  const search = searchParams.get("search")

  const where: any = {}
  if (status) where.status = status
  if (courseId) where.courseId = courseId
  if (batchId) where.batchId = batchId
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { studentId: { contains: search } },
      { phone: { contains: search } },
    ]
  }

  const students = await prisma.student.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { course: true, batch: true },
  })

  return success(students)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const studentId = data.studentId || `SIS-${Date.now()}`

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: data.address,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        courseId: data.courseId,
        batchId: data.batchId,
        status: data.status || "APPLIED",
      },
      include: { course: true, batch: true },
    })

    return success(student, 201)
  } catch (e) {
    console.error(e)
    return error("Something went wrong", 500)
  }
}
