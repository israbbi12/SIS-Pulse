import { success } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const db = new GoogleDB(user.id)
    const [allStudents, allCourses, allBatches] = await Promise.all([
      db.getAll("Students"),
      db.getAll("Courses"),
      db.getAll("Batches"),
    ])

    const totalStudents = allStudents.filter((s: any) => s.status === "ADMITTED").length
    const totalAdmissions = allStudents.length
    const totalCourses = allCourses.filter((c: any) => c.active !== false).length
    const totalBatches = allBatches.filter((b: any) => b.active !== false).length
    const pendingApplications = allStudents.filter((s: any) => s.status === "APPLIED").length

    return success({
      totalStudents,
      totalAdmissions,
      totalCourses,
      totalBatches,
      admittedStudents: totalStudents,
      pendingApplications,
    })
  } catch {
    return Response.json({ success: false, error: "Something went wrong" }, { status: 500 })
  }
}
