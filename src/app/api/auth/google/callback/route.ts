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

    const googleAccount = await prisma.googleAccount.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
      },
      create: {
        userId: user.id,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
      },
    })

    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?google=connected`)
  } catch (e) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?google=error`)
  }
}
