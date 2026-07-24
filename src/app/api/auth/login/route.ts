import { prisma } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"
import { success, error } from "@/lib/api-response"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return error("Email and password are required")

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error("Invalid credentials", 401)
    if (!user.active) return error("Account is deactivated", 403)

    const valid = await verifyPassword(password, user.password)
    if (!valid) return error("Invalid credentials", 401)

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    const response = NextResponse.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch {
    return error("Something went wrong", 500)
  }
}
