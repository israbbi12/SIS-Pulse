import { prisma } from "@/lib/db"
import { NextRequest } from "next/server"
import { error } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    if (!studentId) return error("studentId required")

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { course: true, batch: true },
    })
    if (!student) return error("Student not found", 404)

    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("portrait", "mm", "a4")

    doc.setDrawColor(41, 128, 185)
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, 210, 50, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("STUDENT ID CARD", 105, 25, { align: "center" })
    doc.setFontSize(12)
    doc.text("SIS-Pulse | Student Information System", 105, 38, { align: "center" })

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`${student.firstName} ${student.lastName}`, 25, 70)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const details = [
      ["Student ID", student.studentId],
      ["Course", student.course?.name || "N/A"],
      ["Batch", student.batch?.name || "N/A"],
      ["Phone", student.phone || "N/A"],
      ["Email", student.email || "N/A"],
      ["Guardian", student.guardianName || "N/A"],
      ["Guardian Phone", student.guardianPhone || "N/A"],
      ["Issue Date", new Date().toLocaleDateString()],
    ]

    let y = 85
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${label}:`, 25, y)
      doc.setFont("helvetica", "normal")
      doc.text(value, 65, y)
      y += 8
    })

    doc.setDrawColor(41, 128, 185)
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 280, 210, 20, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text("This is a digitally generated ID card. Valid only for the current academic year.", 105, 292, { align: "center" })

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="idcard-${student.studentId}.pdf"`,
      },
    })
  } catch (e) {
    return error("Failed to generate PDF", 500)
  }
}
