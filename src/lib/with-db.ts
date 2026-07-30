import { getCurrentUser } from "./auth"
import { GoogleDB } from "./google-db"
import { error } from "./api-response"

export async function getGoogleDB(): Promise<{ db: GoogleDB; userId: string }> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return { db: new GoogleDB(user.id), userId: user.id }
}

export async function requireGoogleDB() {
  try {
    return await getGoogleDB()
  } catch (e: any) {
    return { error: error(e.message, 401) }
  }
}
