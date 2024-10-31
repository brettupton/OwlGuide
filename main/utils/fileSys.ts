import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'
import Papa from 'papaparse'
import { CSVCourse, XLSXCourse } from '../../types/Enrollment'
import { XLSXDecision } from '../../types/Decision'

const tempPath = path.join(__dirname, '..', 'main', 'tmp')

const readCSVFile = (filePath: string): Promise<CSVCourse[]> => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath)
        Papa.parse(stream, {
            beforeFirstChunk: (chunk) => {
                const lines = chunk.split("\n")
                const header = "UnitNumber,Term,Year,DepartmentName,CourseNumber,SectionNumber,ProfessorName,MaximumCapacity,EstPreEnrollment,ActualEnrollment,ContinuationClass,EveningClass,ExtensionClass,TextnetFlag,Location,CourseTitle,CourseID"

                const newChunk = [header, ...lines].join("\n")
                return newChunk
            },
            header: true,
            complete: (results, file) => {
                const result = results.data as CSVCourse[]
                resolve(result)
            },
            error: (error, file) => {
                reject(error)
            }
        })
    })
}

const readXLSXFile = (filePath: string, process: "enrollment" | "decision"): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const wb = XLSX.readFile(filePath)
            const wsname = wb.SheetNames[0]
            let ws = wb.Sheets[wsname]
            // Decision XLSX has four unncessary rows at beginning of sheet
            const startingRow = process === "decision" ? 4 : 0
            let data: (XLSXCourse | XLSXDecision)[] = XLSX.utils.sheet_to_json(ws, { range: startingRow })

            resolve(data)
        } catch (error) {
            reject(`Error reading XLSX file: ${error}`)
        }
    })
}

const writeTempDir = (data: string | NodeJS.ArrayBufferView): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(tempPath)) {
            // Create directory if doesn't exist
            fs.mkdir(tempPath, { recursive: true }, (err) => {
                if (err) {
                    reject("Couldn't create temp directory.")
                }
                // Write new file to temp directory
                fs.writeFile(path.join(tempPath, 'temp.txt'), data, (err) => {
                    if (err) {
                        reject(`Error writing data: ${err}`)
                    }
                    resolve()
                })
            })
        } else {
            // Directory exists and needs to be empty before new file
            fs.readdir(tempPath, (err, files) => {
                if (err) {
                    reject(`Couldn't read temp directory: ${err}`)
                }
                // Delete files in temp directory before writing new file
                files.forEach((file) => {
                    fs.unlinkSync(path.join(tempPath, file))
                })
                // After unlinking all files, write file to path
                fs.writeFile(path.join(tempPath, 'temp.txt'), data, (err) => {
                    if (err) {
                        reject(`Error writing data: ${err}`)
                    }
                    resolve()
                })
            })
        }
    })
}

const readTempDir = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(tempPath)) {
            fs.readdir(tempPath, (err, files) => {
                if (err) {
                    reject(`Couldn't read temp directory: ${err}`)
                }
                if (files.length > 1) {
                    reject("More than one file located in temp directory.")
                }

                fs.readFile(path.join(tempPath, files[0]), (err, data) => {
                    if (err) {
                        reject(`Error reading ${files[0]} in temp directory.`)
                    }
                    resolve(data.toString())
                })
            })
        } else {
            reject("Temp directory missing.")
        }
    })
}

export const fileSys = {
    temp: {
        read: readTempDir,
        write: writeTempDir
    },
    csv: {
        read: readCSVFile
    },
    xlsx: {
        read: readXLSXFile
    }
}