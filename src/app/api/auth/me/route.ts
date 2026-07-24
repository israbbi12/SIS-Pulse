import { getCurrentUser } from "@/lib/auth"
import { success, error } from "@/lib/api-response"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return error("Not authenticated", 401)
    return success(user)
  } catch {
    return error("Something went wrong", 500)
  }
}
