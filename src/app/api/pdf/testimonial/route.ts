import { NextRequest } from "next/server"
import { error } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    if (!studentId) return error("studentId required")

    const db = new GoogleDB(user.id)
    const student = await db.getById("Students", studentId)
    if (!student) return error("Student not found", 404)

    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("portrait", "mm", "a4")

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("TESTIMONIAL", 105, 30, { align: "center" })
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const lines = [
      "",
      `This is to certify that ${student.firstName} ${student.lastName} was a student of our institution.`,
      "",
      `Student ID: ${student.studentId}`,
      `Course: ${student.course?.name || student.courseId || "N/A"}`,
      `Batch: ${student.batch?.name || student.batchId || "N/A"}`,
      `Date of Birth: ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}`,
      "",
      `${student.firstName} ${student.lastName} was a diligent student and maintained good conduct during their study period.`,
      "",
      "This testimonial is issued upon request for educational and professional purposes.",
      "",
      "",
      "",
      `Date: ${new Date().toLocaleDateString()}`,
      "",
      "Authorized Signature",
    ]

    let y = 50
    for (const line of lines) {
      doc.text(line, 25, y)
      y += 8
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="testimonial-${student.studentId}.pdf"`,
      },
    })
  } catch (e) {
    return error("Failed to generate PDF", 500)
  }
}
