import { safeStorage } from 'electron'
import fs from 'fs'
import { readJSON } from './fileHandler'
import { paths } from './paths'

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

const getConfigValue = (key: string, decrypt?: boolean): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (fs.existsSync(paths.configPath)) {
            try {
                const config = await readJSON(paths.configPath)
                let configVal = config[key] ?? ""

                if (decrypt && config[key]) {
                    const valBuffer = Buffer.from(config[key], 'base64')
                    configVal = safeStorage.decryptString(valBuffer)
                }

                resolve(configVal)
            } catch (error) {
                reject(`Config error: ${error}`)
            }
        } else {
            const config = {}
            fs.writeFile(paths.configPath, JSON.stringify(config, null, 2), (err) => {
                if (err) {
                    throw new Error(`${err}`)
                }
                resolve("")
            })
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
                            throw new Error(`${err}`)
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

export const config = {
    read: getConfigValue,
    write: updateConfigValue,
    delete: removeConfigKey
}