import { bSQLDB, paths } from "../utils"
import fs from 'fs'
import path from 'path'

export const replaceTables = async (files: string[]) => {
    if (files.length === 4) {
        try {
            // Tables that have foreign key references need their referenced table to be created first
            const order = ['MRP008', 'ADP001', 'ADP006', 'ADP003']
            files.sort((a, b) => {
                const nameA = a.split('\\').pop().split('.')[0]
                const nameB = b.split('\\').pop().split('.')[0]

                return order.indexOf(nameA) - order.indexOf(nameB)
            })

            for (const filePath of files) {
                await bSQLDB.all.createTable(filePath)
            }
        } catch (error) {
            throw error
        }
    }
}

// export const dropTables = async () => {
//     try {
//         const files = [
//             path.join(paths.tablesPath, 'MRP008.csv'),
//             path.join(paths.tablesPath, 'ADP001.csv'),
//             path.join(paths.tablesPath, 'ADP006.csv'),
//             path.join(paths.tablesPath, 'ADP003.csv')]

//         for (const file of files) {
//             console.log(file)
//             await bSQLDB.all.createTable(file)
//         }
//     } catch (error) {
//         throw error
//     }
// }

export const initializeDB = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(paths.extraResourceDbPath)) {
            if (!fs.existsSync(path.join(paths.userDataPath, 'db/owlguide-2.db'))) {
                fs.mkdir(path.join(paths.userDataPath, 'db'), { recursive: true }, (err) => {
                    if (err) { reject(err) }
                    fs.copyFile(paths.extraResourceDbPath, path.join(paths.userDataPath, 'db/owlguide-2.db'), (err) => {
                        if (err) { reject(err) }
                    })
                    resolve()
                })
            }
        }
        resolve()
    })
}

