import fs from 'fs'
import { config, paths } from "../utils"
import { app } from 'electron'
import { initializeDB } from '../processes/helpers/sqlDatabase'

export const initializeApp = (): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        const appVer = await config.read('appVersion', false)
        const checkPaths = ["config", "temp"]
        const pathEntries = Object.entries(paths)

        // Create any necessary non-existing paths
        for (let i = 0; i < pathEntries.length; i++) {
            const [pathName, fullPath] = pathEntries[i]

            if (checkPaths.filter((substr) => pathName.includes(substr)).length > 0)
                if (!fs.existsSync(fullPath)) {
                    try {
                        switch (pathName) {
                            case "configPath":
                                const config = {}
                                fs.writeFileSync(fullPath, JSON.stringify(config, null, 2))
                                break
                            case "tempPath":
                                fs.mkdirSync(fullPath, { recursive: true })
                                break
                        }
                    } catch (error) {
                        reject(error)
                    }
                }
        }

        // No/New app version requires creation/recreation of database and reset of config values
        if (appVer !== app.getVersion()) {
            try {
                await Promise.all([
                    initializeDB(),
                    config.write([
                        ['appVersion', app.getVersion()],
                        ['updateYear', '22'],
                        ['dbUpdateTime', "0001-01-01-00.00.00.000000"]
                    ])
                ])
                resolve()
            } catch (error) {
                reject(error)
            }
        }
        resolve()
    })
}