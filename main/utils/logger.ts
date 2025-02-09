import path from "path"
import fs from "fs"
import { paths } from "./paths"

type LogType = "main" | "sql" | "acs" | "error"

const addNewLog = (logType: LogType, details: string[]) => {
    const timeStamp = new Date().toLocaleString().toUpperCase()
    const logFilePath = path.join(paths.logPath, `owlguide-${logType}.log`)
    // Filter 'truthy' values from array before join
    const newDetails = details.map((detail) => { return detail.toUpperCase() }).filter(Boolean)

    const logLine = (`[${timeStamp}]: ${newDetails.join(" ")}\n`)
    fs.appendFile(logFilePath, logLine, (err) => { if (err) console.error(err) })
}

export const logger = { addNewLog }