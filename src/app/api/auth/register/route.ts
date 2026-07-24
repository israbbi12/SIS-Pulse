import { prisma } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"
import { success, error } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json()
    if (!name || !email || !password) return error("Name, email, and password are required")

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return error("Email already in use")

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, role: "STAFF" },
    })

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    return success({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201)
  } catch (e) {
    return error("Something went wrong", 500)
  }
}
