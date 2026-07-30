import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Not authenticated", 401)
    const account = await prisma.googleAccount.findUnique({ where: { userId: user.id } })
    return success({
      connected: !!account,
      googleEmail: account?.googleEmail || null,
      hasSpreadsheet: !!account?.spreadsheetId,
    })
  } catch {
    return error("Something went wrong", 500)
  }
}
