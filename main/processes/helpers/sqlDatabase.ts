import { bSQLDB, paths } from "../../utils"
import fs from 'fs'
import path from 'path'
import { newWorker } from "../worker"

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

export const getIBMTables = async (userId: string) => {
    const tables = ['ADP001', 'ADP003', 'ADP006', 'MRP008', 'MRP009', 'MRP012']
    const batchPath = path.join(__dirname, '..', 'main', 'processes', 'helpers', 'acsWorker.js')
    const downloadDir = path.join(__dirname, '..', 'tmp')
    const workerPromises: Promise<void>[] = []

    tables.forEach((table) => {
        workerPromises.push(newWorker(batchPath, table, { table, userId, downloadDir }))
    })

    const results = await Promise.allSettled(workerPromises)

    return results
}