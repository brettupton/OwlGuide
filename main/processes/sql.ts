import { bSQLDB } from "../utils"
import path from 'path'

export const replaceTables = async (files: string[]) => {
    try {
        // Tables that have foreign key references need their reference table to be created first
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

export const dropTables = async (resourcePath: string) => {
    try {
        const files = [
            path.join(resourcePath, 'MRP008.csv'),
            path.join(resourcePath, 'ADP001.csv'),
            path.join(resourcePath, 'ADP006.csv'),
            path.join(resourcePath, 'ADP003.csv')]

        for (const file of files) {
            console.log(file)
            await bSQLDB.all.createTable(file)
        }
    } catch (error) {
        throw error
    }
}