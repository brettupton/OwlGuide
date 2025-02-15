import path from "path"
import fs from "fs"
import { paths } from "./paths"

type LogType = "main" | "sql" | "acs" | "error"

const addNewLog = (logType: LogType, details: any[]) => {
    const timeStamp = new Date().toLocaleString().toUpperCase()
    const logFilePath = path.join(paths.logPath, `owlguide-${logType}.log`)
    // Convert any non-string values to strings & filter 'truthy' values from array before joining
    const newDetails = details
        .map((detail) => {
            if (typeof detail !== "string") {
                detail = detail.toString()
            }

            return detail.toUpperCase()
        }).filter(Boolean)

    const logLine = (`[${timeStamp}]: ${newDetails.join(" ")}\n`)
    fs.appendFile(logFilePath, logLine, (err) => { if (err) console.error(err) })
}

export const logger = { addNewLog }