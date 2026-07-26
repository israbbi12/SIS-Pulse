import { getSheetsClient, findOrCreateSpreadsheet } from "./google-drive"

export class GoogleDB {
  private userId: string
  private spreadsheetId: string | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  private async init() {
    if (!this.spreadsheetId) {
      this.spreadsheetId = await findOrCreateSpreadsheet(this.userId)
    }
  }

  private serialize(data: any): any {
    const result: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) result[key] = value.toISOString()
      else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = JSON.stringify(value)
      } else result[key] = value ?? ""
    }
    return result
  }

  private deserialize(row: Record<string, string>): any {
    const result: any = {}
    for (const [key, value] of Object.entries(row)) {
      if (value === "" || value === undefined) {
        result[key] = null
      } else if (["createdAt", "updatedAt", "admissionDate", "dateOfBirth", "startDate", "endDate"].includes(key)) {
        result[key] = new Date(value)
      } else if (["fee", "marks", "totalMarks"].includes(key)) {
        result[key] = parseFloat(value) || 0
      } else if (["active"].includes(key)) {
        result[key] = value === "true"
      } else {
        result[key] = value
      }
    }
    return result
  }

  private async sid(): Promise<string> {
    await this.init()
    return this.spreadsheetId!
  }

  async getAll(sheetName: string): Promise<any[]> {
    const spreadsheetId = await this.sid()
    const sheets = await getSheetsClient(this.userId)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    })

    const rows = res.data.values || []
    if (rows.length < 2) return []

    const headers = rows[0]
    return rows.slice(1).map((row: string[]) => {
      const obj: Record<string, string> = {}
      headers.forEach((h: string, i: number) => { obj[h] = row[i] || "" })
      return this.deserialize(obj)
    })
  }

  async getById(sheetName: string, id: string): Promise<any | null> {
    const all = await this.getAll(sheetName)
    return all.find((item: any) => item.id === id) || null
  }

  async findWhere(sheetName: string, field: string, value: any): Promise<any[]> {
    const all = await this.getAll(sheetName)
    return all.filter((item: any) => item[field] == value)
  }

  async findOne(sheetName: string, field: string, value: any): Promise<any | null> {
    const all = await this.getAll(sheetName)
    return all.find((item: any) => item[field] == value) || null
  }

  async create(sheetName: string, data: any): Promise<any> {
    const spreadsheetId = await this.sid()
    const sheets = await getSheetsClient(this.userId)

    const id = data.id || `g-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    const now = new Date().toISOString()
    const row = this.serialize({ ...data, id, createdAt: data.createdAt || now, updatedAt: now })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    })
    const headers = res.data.values?.[0] || []

    const orderedValues = headers.map((h: string) => row[h] ?? "")

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "RAW",
      requestBody: { values: [orderedValues] },
    })

    return this.deserialize({ ...Object.fromEntries(headers.map((h: string, i: number) => [h, orderedValues[i]])), id })
  }

  async update(sheetName: string, id: string, data: any): Promise<any | null> {
    const spreadsheetId = await this.sid()
    const sheets = await getSheetsClient(this.userId)

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    })

    const rows = res.data.values || []
    if (rows.length < 2) return null

    const headers = rows[0]
    const rowIndex = rows.slice(1).findIndex((row: string[]) => row[0] === id)
    if (rowIndex === -1) return null

    const existing: Record<string, string> = {}
    headers.forEach((h: string, i: number) => { existing[h] = rows[rowIndex + 1][i] || "" })

    const updated = this.serialize({ ...this.deserialize(existing), ...data, id, updatedAt: new Date().toISOString() })
    const orderedValues = headers.map((h: string) => updated[h] ?? "")

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [orderedValues] },
    })

    return this.deserialize(Object.fromEntries(headers.map((h: string, i: number) => [h, orderedValues[i]])))
  }

  async delete(sheetName: string, id: string): Promise<boolean> {
    const spreadsheetId = await this.sid()
    const sheets = await getSheetsClient(this.userId)

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    })

    const rows = res.data.values || []
    if (rows.length < 2) return false

    const rowIndex = rows.slice(1).findIndex((row: string[]) => row[0] === id)
    if (rowIndex === -1) return false

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    })

    return true
  }

  async count(sheetName: string, field?: string, value?: any): Promise<number> {
    const all = await this.getAll(sheetName)
    if (field && value !== undefined) {
      return all.filter((item: any) => item[field] == value).length
    }
    return all.length
  }
}
