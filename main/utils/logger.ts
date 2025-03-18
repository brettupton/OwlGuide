import path from "path"
import fs from "fs"
import { paths } from "./paths"

type LogType = "main" | "sql" | "acs" | "error"

<<<<<<< HEAD
<<<<<<< HEAD
const addNewLog = (logType: LogType, details: string[]) => {
    const timeStamp = new Date().toLocaleString().toUpperCase()
    const logFilePath = path.join(paths.logPath, `owlguide-${logType}.log`)
    // Filter 'truthy' values from array before join
    const newDetails = details.map((detail) => { return detail.toUpperCase() }).filter(Boolean)
=======
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main

    const logLine = (`[${timeStamp}]: ${newDetails.join(" ")}\n`)
    fs.appendFile(logFilePath, logLine, (err) => { if (err) console.error(err) })
}

export const logger = { addNewLog }