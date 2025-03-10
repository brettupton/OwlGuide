import { dialog, app, BrowserWindow, IpcMainEvent } from "electron"
import fs from "fs"
import path from "path"
import { regex } from "../utils"

interface IFiles {
    data: string
    extension: string
}

export const downloadFiles = async (event: IpcMainEvent, process: string, files: IFiles[]) => {
    const downloadPromises = files.map((file) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const dialogResult = await dialog.showSaveDialog({
                    defaultPath: path.join(app.getPath('downloads'), `${process} - ${regex.fileNameTimeStamp()}`),
                    filters: [{ name: "File", extensions: [file.extension] }]
                })

                if (!dialogResult.canceled && dialogResult.filePath) {
                    fs.writeFile(dialogResult.filePath, file.data, (err) => {
                        if (err) { reject(err) }
                        resolve()
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    })

    try {
        await Promise.all(downloadPromises)
        event.reply('download-success')
    } catch (error) {
        throw error
    }
}