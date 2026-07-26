import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { GoogleDB } from "@/lib/google-db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Unauthorized", 401)
    const { id } = await params
    const db = new GoogleDB(user.id)
    const deleted = await db.delete("Results", id)
    if (!deleted) return error("Not found", 404)
    return success({ deleted: true })
  } catch {
    return error("Something went wrong", 500)
  }
}
