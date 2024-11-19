import { bSQLDB, fileManager } from "../utils"
import paths from "../utils/paths"
import fs from 'fs'
import path from 'path'

export const replaceTables = async (uploads?: string[]) => {
    try {
        let files: string[]

        if (!uploads) {
            files = await fileManager.dir.paths(paths.tablesPath)
        } else {
            files = uploads
        }
        // Tables that have foreign key references need their referenced table to be created first
        const order = ['MRP008', 'ADP001', 'ADP006', 'ADP003']
        files.sort((a, b) => {
            const nameA = a.split('\\').pop().split('.')[0]
            const nameB = b.split('\\').pop().split('.')[0]

            return order.indexOf(nameA) - order.indexOf(nameB)
        })

        for (const filePath of files) {
            await bSQLDB.all.replaceTable(filePath)
        }
    } catch (error) {
        throw error
    }
}

export const dropTables = async () => {
    try {
        const files = [
            path.join(paths.tablesPath, 'MRP008.csv'),
            path.join(paths.tablesPath, 'ADP001.csv'),
            path.join(paths.tablesPath, 'ADP006.csv'),
            path.join(paths.tablesPath, 'ADP003.csv')]

        for (const file of files) {
            console.log(file)
            await bSQLDB.all.createTable(file)
        }
    } catch (error) {
        throw error
    }
}

export const initializeDB = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(paths.prodDBPath)) {
            if (!fs.existsSync(path.join(paths.userData, 'db/owlguide-2.db'))) {
                fs.mkdir(path.join(paths.userData, 'db'), { recursive: true }, (err) => {
                    if (err) { reject(err) }
                    fs.copyFile(paths.prodDBPath, path.join(paths.userData, 'db/owlguide-2.db'), (err) => {
                        if (err) { reject(err) }
                    })
                    resolve()
                })
            }
        }
    })
}