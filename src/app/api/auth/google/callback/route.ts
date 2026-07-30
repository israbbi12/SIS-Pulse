import { getTokensFromCode } from "@/lib/google-drive"
import { prisma } from "@/lib/db"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    if (!code || !state) return error("Missing code or state")

    const user = verifyToken(state)
    if (!user) return error("Invalid state token")

    const tokens = await getTokensFromCode(code)
    const oauth2 = await import("googleapis").then(m => m.google.auth.OAuth2)
    const oauth2Client = new oauth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2Client.setCredentials({ access_token: tokens.access_token })
    const drive = (await import("googleapis")).google.drive({ version: "v3", auth: oauth2Client })
    const about = await drive.about.get({ fields: "user" })
    const googleEmail = about.data.user?.emailAddress || null

    await prisma.googleAccount.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        googleEmail,
      },
      create: {
        userId: user.id,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        googleEmail,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return Response.redirect(`${baseUrl}/setup?google=connected`)
  } catch {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return Response.redirect(`${baseUrl}/setup?google=error`)
  }
}
