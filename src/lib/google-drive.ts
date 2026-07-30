import { google } from "googleapis"
import { prisma } from "./db"

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
]

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`
  )
}

export function getAuthUrl(userId: string): string {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: userId,
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getDriveClient(userId: string) {
  const oauth2Client = await getAuthenticatedClient(userId)
  return google.drive({ version: "v3", auth: oauth2Client })
}

export async function getSheetsClient(userId: string) {
  const oauth2Client = await getAuthenticatedClient(userId)
  return google.sheets({ version: "v4", auth: oauth2Client })
}

async function getAuthenticatedClient(userId: string) {
  const account = await prisma.googleAccount.findUnique({ where: { userId } })
  if (!account) throw new Error("Google account not connected")

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
  })

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.googleAccount.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || account.refreshToken,
        },
      })
    }
  })

  return oauth2Client
}

export async function findOrCreateSpreadsheet(userId: string): Promise<string> {
  const account = await prisma.googleAccount.findUnique({ where: { userId } })
  if (account?.spreadsheetId) return account.spreadsheetId

  const drive = await getDriveClient(userId)
  const sheets = await getSheetsClient(userId)

  const file = await drive.files.create({
    requestBody: {
      name: "SIS-Pulse Database",
      mimeType: "application/vnd.google-apps.spreadsheet",
    },
  })

  const spreadsheetId = file.data.id!
  await initSheetTabs(sheets, spreadsheetId)

  await prisma.googleAccount.update({
    where: { userId },
    data: { spreadsheetId },
  })

  return spreadsheetId
}

async function initSheetTabs(sheets: any, spreadsheetId: string) {
  const tabs = ["Users", "Courses", "Batches", "Students", "Results"]
  const headers: Record<string, string[]> = {
    Users: ["id", "name", "email", "password", "role", "phone", "active", "createdAt", "updatedAt"],
    Courses: ["id", "name", "code", "description", "duration", "fee", "active", "createdAt", "updatedAt"],
    Batches: ["id", "name", "courseId", "startDate", "endDate", "active", "createdAt", "updatedAt"],
    Students: ["id", "studentId", "firstName", "lastName", "dateOfBirth", "gender", "phone", "email", "address", "guardianName", "guardianPhone", "photo", "courseId", "batchId", "admissionDate", "status", "createdAt", "updatedAt"],
    Results: ["id", "studentId", "batchId", "subject", "marks", "totalMarks", "grade", "semester", "createdAt", "updatedAt"],
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { updateSheetProperties: { properties: { title: tabs[0] }, fields: "title" } },
        ...tabs.slice(1).map((t) => ({ addSheet: { properties: { title: t } } })),
      ],
    },
  })

  for (const tab of tabs) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers[tab]] },
    })
  }
}
