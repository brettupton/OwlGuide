import { fileManager } from "../utils"
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
                await fileManager.config.write('enrlPath', filePath)
                event.reply('data', { enrollment })
            } catch (error) {
                throw error
            }
            break

        case 'file-download':
            try {
                const prevFile = await fileManager.config.read('enrlPath')

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