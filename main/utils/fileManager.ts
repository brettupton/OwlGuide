import fs from 'fs'
import path from 'path'
import XLSX from '@e965/xlsx'
import Papa from 'papaparse'
import { safeStorage } from 'electron'
import { paths } from './'
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

const updateConfig = (key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Convert key and value to encrypted buffer
        const keyBuffer = safeStorage.encryptString(key)
        const valBuffer = safeStorage.encryptString(value)

        // Convert buffers to base64 string for JSON parse later
        const keyEncode = keyBuffer.toString('base64')
        const valEncode = valBuffer.toString('base64')

        console.log(`Key: ${key}; Value: ${value}; Key-Encode: ${keyEncode}; Val-Encode: ${valEncode}`)

        if (!fs.existsSync(paths.configPath)) {
            const config: Config = { [keyEncode]: valEncode }

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
                let keyFound = false
                const config: Config = JSON.parse(data)

                for (const configKey in config) {
                    // Decode key buffer from JSON to check against key needed
                    const configBuffer = Buffer.from(configKey, 'base64')
                    const configDecode = safeStorage.decryptString(configBuffer)

                    console.log(`Key: ${configKey}; Decode: ${configDecode}`)

                    if (configDecode === key) {
                        config[configKey] = valEncode
                        keyFound = true
                    }
                }
                // If key not found in loop, create new value in config
                if (!keyFound) {
                    config[keyEncode] = valEncode
                }
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

const getConfigValue = (key: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(paths.configPath)) {
            fs.readFile(paths.configPath, 'utf-8', (err, data) => {
                if (err) { reject(`Couldn't read config: ${err}`) }
                const config: Config = JSON.parse(data)

                for (const keyEncode in config) {
                    // Decode key buffer from JSON to check against key needed
                    const keyBuffer = Buffer.from(keyEncode, 'base64')
                    const keyDecode = safeStorage.decryptString(keyBuffer)

                    if (keyDecode === key) {
                        // Decode value from found key
                        const valBuffer = Buffer.from(config[keyEncode], 'base64')

                        resolve(safeStorage.decryptString(valBuffer))
                    }
                }
                // If we reach the end of the loop, key doesn't exist
                reject(`${key} does not exist in config.`)
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

const getDirPaths = (dir: string): Promise<string[]> => {
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
        read: getConfigValue,
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
        paths: getDirPaths
    }
}