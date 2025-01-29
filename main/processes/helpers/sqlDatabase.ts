import { bSQLDB, paths } from "../../utils"
import fs from 'fs'
import path from 'path'
import tables from "../../db/tables"
import { TableData } from "../../../types/Database"
import { spawn } from "child_process"

export const updateDB = async (files: string[]) => {
    if (files.length === 6) {
        try {
            await bSQLDB.all.updateDB(files)
        } catch (error) {
            throw error
        }
    } else {
        throw "Update requires six files: MRP008, ADP001, ADP006, ADP003, MRP009, MRP012"
    }
}

export const initializeDB = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(paths.dbPath)) {
            fs.mkdir(path.join(paths.userDataPath, 'db'), { recursive: true }, async (err) => {
                if (err) { reject(err) }
                try {
                    await bSQLDB.all.createDB()
                    resolve()
                } catch (error) {
                    reject(error)
                }
            })
        } else {
            try {
                await bSQLDB.all.createDB()
                resolve()
            } catch (error) {
                reject(error)
            }
        }
    })
}

export const getIBMTables = async (userId: string, password: string) => {
    const downloadDir = path.join(__dirname, '..', 'tmp')
    const acsExec = `"C:\\Users\\Public\\IBM\\ClientSolutions\\Start_Programs\\Windows_i386-32\\acslaunch_win-32.exe"`
    const tablePromises: Promise<void>[] = []

    Object.keys(tables).forEach(async (tableName) => {
        const table = tables[tableName] as TableData
        const statement = bSQLDB.all.buildSelectStmt(table)
        const clientFile = `${downloadDir}/${tableName}.csv`
        const command = `${acsExec} /plugin=cldownload /system=${process.env.IBM_SYSTEM_HOST} /sql="${statement}" /clientfile="${clientFile}"`
        const devBatch = path.join(__dirname, '..', 'main', 'db', 'dev-acs.bat')

        tablePromises.push(new Promise((resolve, reject) => {
            const acsProcess = spawn(command, { shell: true })

            acsProcess.stdout.on('data', (data) => {
                const output = data.toString()

                if (output.includes('User')) {
                    acsProcess.stdin.write(`${userId}\n`)
                }

                if (output.includes('Password')) {
                    acsProcess.stdin.write(`${password}\n`)
                }
            })

            acsProcess.stderr.on('data', (data) => {
                reject(`Error from ${tableName}: ${data.toString()}`)
            })

            acsProcess.on('close', (code) => {
                // Do something when closed
            })

            acsProcess.on('exit', (code) => {
                if (code !== 0) {
                    reject(`Failed to download ${tableName}, exit code: ${code}`)
                }
                resolve()
            })
        })
        )
    })

    try {
        await Promise.all(tablePromises)
    } catch (error) {
        throw error
    }
}