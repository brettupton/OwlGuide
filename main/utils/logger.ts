import fs from 'fs'
import path from 'path'
import { paths } from './'

interface ILogData {
    logType: string
    process: string
    method: string
    term?: string
    text?: string
}

const newLog = (logData: ILogData) => {
    const date = new Date()
    let line = `[${date.toLocaleString()}] ${logData.logType.toUpperCase()} ${logData.process.toUpperCase()} ${logData.method.toUpperCase()} ${logData.term ?? ''} ${logData.text ?? ''}\n`

    fs.appendFile(path.join(paths.logPath, 'owlguide-log.log'), line, (err) => {
        if (err) {
            console.error(err)
        }
    })
}

export const logger = { newLog }