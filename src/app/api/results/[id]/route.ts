import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.result.delete({ where: { id } })
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
