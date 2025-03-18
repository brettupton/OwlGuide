import fs from 'fs'
<<<<<<< HEAD
import path from 'path'
import XLSX from '@e965/xlsx'
import Papa from 'papaparse'
import { safeStorage } from 'electron'
import { paths } from '.'
=======
import XLSX from '@e965/xlsx'
import Papa from 'papaparse'
>>>>>>> main

const parseCSV = (filePath: string): Promise<{ [field: string]: string | number }[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(fs.createReadStream(filePath), {
            complete: (results) => {
                const { data } = results
                resolve(data as { [field: string]: string | number }[])
            },
            error: (error: Error) => { reject(error) }
        })
    })
}

const parseXLSX = (filePath: string): Promise<{ [key: string]: string | number }[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const wb = XLSX.readFile(filePath)
            const wsname = wb.SheetNames[0]
            let ws = wb.Sheets[wsname]
            let data: { [key: string]: string | number }[] = XLSX.utils.sheet_to_json(ws)

            resolve(data)
        } catch (error) {
            reject(`Error reading XLSX file: ${error}`)
        }
    })
}

const createXLSX = (data: DBRow[]): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(data)

            // Calculate max width for each column and set on worksheet
            const columns = Object.keys(data[0] || {})
            const columnWidths = columns.map(column => {
                return {
                    wch: Math.max(
                        column.length, // Header width
                        ...data.map(row => String(row[column] ?? "").length), // Max data length

                    ) + 2
                }
            })
            ws["!cols"] = columnWidths

            XLSX.utils.book_append_sheet(wb, ws, "Report")

            // Write workbook as binary data
            const xlsxBuffer: Buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer", cellStyles: true })

            resolve(xlsxBuffer)
        } catch (error) {
            reject(error)
        }
    })
}

<<<<<<< HEAD
const createDir = (dir: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) { reject(err) }
            resolve()
        })
    })
}

=======
>>>>>>> main
const getDirFileNames = (dir: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dir)) {
            fs.readdir(dir, (err, files) => {
                if (err) { reject(err) }
                resolve(files)
            })
        } else {
            reject(`Directory ${dir} does not exist.`)
        }
    })
}

const deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) { reject(err) }
                resolve()
            })
        }
    })
}

export const readJSON = (filePath: string): Promise<JSObj> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) { reject(err) }

            try {
                const JSONObj: JSObj = JSON.parse(data.toString())
                resolve(JSONObj)
            } catch (error) {
                reject(error)
            }
        })
    })
}

export const fileHandler = {
    csv: {
        read: parseCSV
    },
    xlsx: {
        read: parseXLSX,
        write: createXLSX
    },
    files: {
<<<<<<< HEAD
        create: createDir,
=======
>>>>>>> main
        names: getDirFileNames,
        delete: deleteFile
    },
    JSON: {
        read: readJSON
    }
}