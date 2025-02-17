import { bSQLDB, paths, fileManager, regex, logger } from "../../utils"
import fs from 'fs'
import path from 'path'
import { spawn } from "child_process"
import tables from "../../db/tables"
import { TableData } from "../../../types/Database"

export const updateDB = async (files: string[]) => {
    if (files.length === 6) {
        try {
            const timeStart = Date.now()
            await bSQLDB.all.updateDB(files)
            await fileManager.config.write("dbUpdateTime", regex.ISOtoDb2Time(new Date().toISOString()), false)
            const timeEnd = Date.now()

            console.log(`DB Updated in ${(timeEnd - timeStart) / 1000}s`)
        } catch (error) {
            throw error
        }
    } else {
        throw "Update requires six files: MRP008, ADP001, ADP006, ADP003, MRP009, MRP012"
    }
}

export const initializeDB = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        await fileManager.config.write('dbUpdateTime', "0001-01-01-00.00.00.000000", false)

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
    const acsExec = `"C:\\Users\\Public\\IBM\\ClientSolutions\\Start_Programs\\Windows_i386-32\\acslaunch_win-32.exe"`

    const tablePromises = Object.keys(tables).map((tableName) => {
        return new Promise<void>(async (resolve, reject) => {
            const table = tables[tableName] as TableData
            const statement = await bSQLDB.all.buildSelectStmt(table)
            const clientFile = path.join(paths.tempPath, `${tableName}.csv`)
            const command = `${acsExec} /plugin=cldownload /system=STORES01.BNCOLLEGE.COM /sql="${statement}" /clientfile="${clientFile}"`
            const devBatch = path.join(__dirname, '..', 'main', 'db', 'dev-acs.bat')

            const timeStart = Date.now()
            logger.addNewLog("acs", [tableName, command])

            const acsProcess = spawn(command, { shell: true })
            acsProcess.on('error', (err) => {
                logger.addNewLog("acs", [tableName, "Spawn Error", JSON.stringify(err)])
                reject(`Error creating spawn: ${err.message}`)
            })

            acsProcess.stdout.on('data', (data) => {
                const output = data.toString()
                logger.addNewLog("acs", [tableName, "Output", output])

                if (output.includes('User')) {
                    acsProcess.stdin.write(`${userId}\n`)
                }

                if (output.includes('Password')) {
                    acsProcess.stdin.write(`${password}\n`)
                }
            })

            acsProcess.stderr.on('data', (data) => {
                logger.addNewLog("acs", [tableName, "stderr", data.toString()])
                reject(`Error from ${tableName}: ${data.toString()}`)
            })

            acsProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(`Failed to download ${tableName}, exit code: ${code}`)
                }
                const timeEnd = Date.now()
                logger.addNewLog("acs", [tableName, `Completed in ${(timeEnd - timeStart) / 1000}s`])

                resolve()
            })
        })
    })
    try {
        await Promise.all(tablePromises)
    } catch (error) {
        throw error
    }
}