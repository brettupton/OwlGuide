import { bSQLDB, paths } from "../utils"
import fs from 'fs'
import path from 'path'

export const updateTables = async (files: string[]) => {
    if (files.length === 6) {
        try {
            await bSQLDB.all.updateDB(files)
        } catch (error) {
            throw error
        }
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

