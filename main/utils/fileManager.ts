import fs from 'fs'
import path from 'path'
import XLSX from '@e965/xlsx'
import Papa from 'papaparse'
import paths from './paths'
import { CSVCourse } from '../../types/Enrollment'

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
            let data: any[] = XLSX.utils.sheet_to_json(ws, { range: startingRow })

            resolve(data)
        } catch (error) {
            reject(`Error reading XLSX file: ${error}`)
        }
    })
}

const updateConfig = (key: string, value: Buffer): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(paths.configPath)
        if (!fs.existsSync(paths.configPath)) {
            // Convert buffer value to base64 encoded string for JSON storage
            const config: Config = { [key]: value.toString('base64') }

            fs.writeFile(paths.configPath, JSON.stringify(config, null, 2), (err) => {
                if (err) {
                    reject(`Error writing ${key} to config: ${err}`)
                }
                resolve()
            })
        } else {
            // Config file exists and only need to update key value
            fs.readFile(paths.configPath, 'utf-8', (err, data) => {
                if (err) {
                    reject(`Couldn't read config: ${err}`)
                }
                const config: Config = JSON.parse(data)
                config[key] = value.toString('base64')

                fs.writeFile(paths.configPath, JSON.stringify(config, null, 2), (err) => {
                    if (err) {
                        reject(`Error writing ${key} to config: ${err}`)
                    }
                    resolve()
                })
            })
        }
    })
}

const getConfigValueBuffer = (key: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(paths.configPath)) {
            fs.readFile(paths.configPath, 'utf-8', (err, data) => {
                if (err) { reject(`Couldn't read config: ${err}`) }
                const config: Config = JSON.parse(data)

                if (config[key]) {
                    // Decrypts string from file and returns Buffer
                    resolve(Buffer.from(config[key], 'base64'))
                } else {
                    reject(`${key} does not exist in config.`)
                }
            })
        } else {
            reject('Config does not exist.')
        }
    })
}

const removeConfigKey = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(paths.configPath)) {
            fs.readFile(paths.configPath, 'utf-8', (err, data) => {
                if (err) { reject(`Couldn't read config: ${err}`) }
                const config: Config = JSON.parse(data)

                try {
                    delete config[key]

                    fs.writeFile(paths.configPath, JSON.stringify(config, null, 2), (err) => {
                        if (err) {
                            reject(`Error writing ${key} to config: ${err}`)
                        }
                        resolve()
                    })
                } catch (error) {
                    reject(`Couldn't delete ${key} from config.`)
                }
            })
        } else {
            reject(`Config does not exist.`)
        }
    })
}

const getDirFilePaths = (dir: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const filePaths: string[] = []
        if (fs.existsSync(dir)) {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(`Couldn't read directory: ${err}`)
                }

                files.forEach((file) => {
                    filePaths.push(path.join(dir, file))
                })
                resolve(filePaths)
            })
        } else {
            reject(`Directory ${dir} not found.`)
        }
    })
}

export const fileManager = {
    config: {
        read: getConfigValueBuffer,
        write: updateConfig,
        delete: removeConfigKey
    },
    csv: {
        read: readCSVFile
    },
    xlsx: {
        read: readXLSXFile
    },
    dir: {
        paths: getDirFilePaths
    }
}