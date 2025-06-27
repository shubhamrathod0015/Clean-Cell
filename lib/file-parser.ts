export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {  
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          reject(new Error("File must contain headers and at least one data row"))
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
        const data = []

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          if (values.length === headers.length) {
            const row: any = {}
            headers.forEach((header, index) => {
              row[header] = processValue(values[index], header)
            })
            data.push(row)
          }
        }

        resolve(data)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export async function parseXLSX(file: File): Promise<any[]> {
  // For demo purposes, we'll simulate XLSX parsing
  // In a real implementation, you'd use a library like xlsx or exceljs
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate parsing delay
      resolve([
        {
          ClientID: "C001",
          ClientName: "Demo Client",
          PriorityLevel: 3,
          RequestedTaskIDs: ["T001", "T002"],
          GroupTag: "Premium",
          AttributesJSON: '{"region": "North"}',
        },
      ])
    }, 1000)
  })
}

function parseCSVLine(line: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function processValue(value: string, header: string): any {
  // Remove quotes
  value = value.replace(/^"|"$/g, "").trim()

  // Handle different data types based on header
  if (header === "RequestedTaskIDs" || header === "Skills" || header === "RequiredSkills") {
    return value ? value.split(",").map((s) => s.trim()) : []
  }

  if (header === "AvailableSlots" || header === "PreferredPhases") {
    if (value.startsWith("[") && value.endsWith("]")) {
      // Handle array format [1,2,3]
      return value
        .slice(1, -1)
        .split(",")
        .map((s) => Number.parseInt(s.trim()))
        .filter((n) => !isNaN(n))
    } else if (value.includes("-")) {
      // Handle range format 1-3
      const [start, end] = value.split("-").map((s) => Number.parseInt(s.trim()))
      if (!isNaN(start) && !isNaN(end)) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      }
    } else {
      // Handle comma-separated format
      return value
        ? value
            .split(",")
            .map((s) => Number.parseInt(s.trim()))
            .filter((n) => !isNaN(n))
        : []
    }
  }

  if (
    header === "PriorityLevel" ||
    header === "MaxLoadPerPhase" ||
    header === "Duration" ||
    header === "MaxConcurrent" ||
    header === "QualificationLevel"
  ) {
    const num = Number.parseInt(value)
    return isNaN(num) ? 0 : num
  }

  return value
}
