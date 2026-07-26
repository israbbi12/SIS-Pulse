import { getAuthUrl } from "@/lib/google-drive"
import { getCurrentUser } from "@/lib/auth"
import { success, error } from "@/lib/api-response"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Not authenticated", 401)
    const url = getAuthUrl(user.id)
    return success({ url })
  } catch (e) {
    return error("Failed to generate auth URL", 500)
  }
}
