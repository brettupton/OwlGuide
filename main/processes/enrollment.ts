<<<<<<< HEAD
<<<<<<< HEAD
import { fileManager } from "../utils"
=======
import { config } from "../utils"
>>>>>>> main
=======
import { config } from "../utils"
>>>>>>> main
import { matchEnrollment, submitEnrollment } from "./helpers/enrlmntFile"
import { dialog, app } from 'electron'
import path from 'path'
import fs from 'fs'

export const enrollmentProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'file-upload':
            try {
                const filePath: string = data[0]
                const enrollment = await matchEnrollment(filePath)
                // Write filepath to config for later retrieval
<<<<<<< HEAD
<<<<<<< HEAD
                await fileManager.config.write('enrollmentPath', filePath, false)
=======
                await config.write('enrollmentPath', filePath, false)
>>>>>>> main
=======
                await config.write('enrollmentPath', filePath, false)
>>>>>>> main
                event.reply('data', { enrollment })
            } catch (error) {
                throw error
            }
            break

        case 'file-download':
            try {
<<<<<<< HEAD
<<<<<<< HEAD
                const prevFile = await fileManager.config.read('enrollmentPath', false)
=======
                const prevFile = await config.read('enrollmentPath', false)
>>>>>>> main
=======
                const prevFile = await config.read('enrollmentPath', false)
>>>>>>> main

                if (typeof data === 'object') {
                    const { fileName, csv } = await submitEnrollment(data["enrollment"], prevFile)

                    dialog.showSaveDialog({
                        defaultPath: path.join(app.getPath('downloads'), `${fileName}_Formatted`),
                        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
                    })
                        .then(async (result) => {
                            if (!result.canceled && result.filePath) {
                                fs.writeFile(result.filePath, csv, (err) => {
                                    if (err) {
                                        throw "Unable to write CSV to selected path."
                                    }
                                    event.reply('success')
                                })
                            }
                        })
                } else {
                    throw "Unexpected data value received from renderer."
                }
            } catch (error) {
                throw error
            }
            break
    }
}