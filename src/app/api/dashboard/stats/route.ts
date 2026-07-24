import { prisma } from "@/lib/db"
import { success } from "@/lib/api-response"

export async function GET() {
  const [totalStudents, totalAdmissions, totalCourses, totalBatches] = await Promise.all([
    prisma.student.count({ where: { status: "ADMITTED" } }),
    prisma.student.count(),
    prisma.course.count({ where: { active: true } }),
    prisma.batch.count({ where: { active: true } }),
  ])

  const admittedStudents = totalStudents
  const pendingApplications = await prisma.student.count({ where: { status: "APPLIED" } })

  return success({
    totalStudents,
    totalAdmissions,
    totalCourses,
    totalBatches,
    admittedStudents,
    pendingApplications,
  })
}
