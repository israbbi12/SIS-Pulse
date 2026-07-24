import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId")
  const batchId = searchParams.get("batchId")

  const where: any = {}
  if (studentId) where.studentId = studentId
  if (batchId) where.batchId = batchId

  const results = await prisma.result.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { student: true, batch: { include: { course: true } } },
  })
  return success(results)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data.studentId || !data.subject || data.marks === undefined) {
      return error("Student, subject, and marks are required")
    }

    const totalMarks = data.totalMarks || 100
    const percentage = (data.marks / totalMarks) * 100
    let grade = "F"
    if (percentage >= 80) grade = "A+"
    else if (percentage >= 70) grade = "A"
    else if (percentage >= 60) grade = "A-"
    else if (percentage >= 50) grade = "B"
    else if (percentage >= 40) grade = "C"

    const result = await prisma.result.create({
      data: {
        studentId: data.studentId,
        batchId: data.batchId,
        subject: data.subject,
        marks: parseFloat(data.marks),
        totalMarks,
        grade,
        semester: data.semester,
      },
      include: { student: true, batch: { include: { course: true } } },
    })
    return success(result, 201)
  } catch (e) {
    console.error(e)
    return error("Something went wrong", 500)
  }
}
