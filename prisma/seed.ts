import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12)
  const staffPassword = await bcrypt.hash("staff123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@sis-pulse.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@sis-pulse.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "01700000000",
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: "staff@sis-pulse.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@sis-pulse.com",
      password: staffPassword,
      role: "STAFF",
      phone: "01700000001",
    },
  })

  const cse = await prisma.course.upsert({
    where: { code: "CSE" },
    update: {},
    create: {
      name: "Computer Science & Engineering",
      code: "CSE",
      description: "4-year undergraduate program in CSE",
      duration: "4 Years",
      fee: 200000,
    },
  })

  const eee = await prisma.course.upsert({
    where: { code: "EEE" },
    update: {},
    create: {
      name: "Electrical & Electronic Engineering",
      code: "EEE",
      description: "4-year undergraduate program in EEE",
      duration: "4 Years",
      fee: 180000,
    },
  })

  const bba = await prisma.course.upsert({
    where: { code: "BBA" },
    update: {},
    create: {
      name: "Bachelor of Business Administration",
      code: "BBA",
      description: "4-year undergraduate program in BBA",
      duration: "4 Years",
      fee: 150000,
    },
  })

  await prisma.batch.upsert({
    where: { id: "batch-2026-cse" },
    update: {},
    create: {
      id: "batch-2026-cse",
      name: "CSE Batch 2026",
      courseId: cse.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2029-12-31"),
    },
  })

  await prisma.batch.upsert({
    where: { id: "batch-2026-eee" },
    update: {},
    create: {
      id: "batch-2026-eee",
      name: "EEE Batch 2026",
      courseId: eee.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2029-12-31"),
    },
  })

  console.log("Seed completed successfully")
  console.log(`Admin: admin@sis-pulse.com / admin123`)
  console.log(`Staff: staff@sis-pulse.com / staff123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
