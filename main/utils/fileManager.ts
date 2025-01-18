import fs from 'fs'
import path from 'path'
import XLSX from '@e965/xlsx'
import Papa from 'papaparse'
import { safeStorage } from 'electron'
import { paths } from './'

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

const updateConfigValue = (key: string, value: string, encrypt: boolean): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (encrypt) {
            // Encryption to a buffer then convert to base64 string (allows for JSON storage)
            value = safeStorage.encryptString(value).toString('base64')
        }

        if (!fs.existsSync(paths.configPath)) {
            const config: Config = { [key]: value }

            fs.writeFile(paths.configPath, JSON.stringify(config, null, 2), (err) => {
                if (err) {
                    reject(`Error writing ${key} to config: ${err}`)
                }
                resolve()
            })
        } else {
            try {
                const config = await readJSON(paths.configPath)
                config[key] = value

                fs.writeFile(paths.configPath, JSON.stringify(config, null, 2), (err) => {
                    if (err) {
                        throw new Error(`${err}`)
                    }
                    resolve()
                })
            } catch (error) {
                reject(`Error writing ${key} to config: ${error}`)
            }
        }
    })
}

const getConfigValue = (key: string, decrypt: boolean): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (fs.existsSync(paths.configPath)) {
            try {
                const config = await readJSON(paths.configPath)

                if (decrypt && config[key]) {
                    const valBuffer = Buffer.from(config[key], 'base64')
                    resolve(safeStorage.decryptString(valBuffer))
                } else {
                    resolve(config[key])
                }
            } catch (error) {
                reject(`Config error: ${error}`)
            }
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
                    console.error(error)
                    reject(`Couldn't delete ${key} from config.`)
                }
            })
        } else {
            reject(`Config does not exist.`)
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

const readJSON = (filePath: string): Promise<JSObj> => {
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

export const fileManager = {
    config: {
        read: getConfigValue,
        write: updateConfigValue,
        delete: removeConfigKey
    },
    csv: {
        read: parseCSV
    },
    xlsx: {
        read: parseXLSX
    },
    files: {
        delete: deleteFile
    },
    JSON: {
        read: readJSON
    }
}