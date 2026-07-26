import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const batchId_param = searchParams.get("batchId")

    const db = new GoogleDB(user.id)
    let results = await db.getAll("Results")

    if (studentId) results = results.filter((r: any) => r.studentId === studentId)
    if (batchId_param) results = results.filter((r: any) => r.batchId === batchId_param)

    return success(results)
  } catch {
    return error("Something went wrong", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const db = new GoogleDB(user.id)
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

    const result = await db.create("Results", {
      studentId: data.studentId,
      batchId: data.batchId,
      subject: data.subject,
      marks: parseFloat(data.marks),
      totalMarks,
      grade,
      semester: data.semester,
    })

    return success(result, 201)
  } catch {
    return error("Something went wrong", 500)
  }
}
