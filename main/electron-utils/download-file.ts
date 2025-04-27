<<<<<<< HEAD
<<<<<<< HEAD
import { dialog, app, BrowserWindow, IpcMainEvent } from "electron"
import fs from "fs"
=======
import { dialog, app, IpcMainEvent } from "electron"
import fs from 'fs'
>>>>>>> main
=======
import { dialog, app, IpcMainEvent } from "electron"
import fs from 'fs'
>>>>>>> main
import path from "path"
import { regex } from "../utils"

interface IFiles {
<<<<<<< HEAD
<<<<<<< HEAD
    data: string
    extension: string
=======
    data: string | Buffer<ArrayBufferLike>
    extension: string
    name?: string
>>>>>>> main
=======
    data: string | Buffer<ArrayBufferLike>
    extension: string
    name?: string
>>>>>>> main
}

export const downloadFiles = async (event: IpcMainEvent, process: string, files: IFiles[]) => {
    const downloadPromises = files.map((file) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const dialogResult = await dialog.showSaveDialog({
<<<<<<< HEAD
<<<<<<< HEAD
                    defaultPath: path.join(app.getPath('downloads'), `${process} - ${regex.fileNameTimeStamp()}`),
                    filters: [{ name: "File", extensions: [file.extension] }]
=======
                    defaultPath: path.join(app.getPath('downloads'), `${file.name ?? `${process} - ${regex.fileNameTimeStamp()}`}`),
                    filters: [{ name: `${file.extension.toUpperCase()} File`, extensions: [file.extension] }]
>>>>>>> main
=======
                    defaultPath: path.join(app.getPath('downloads'), `${file.name ?? `${process} - ${regex.fileNameTimeStamp()}`}`),
                    filters: [{ name: `${file.extension.toUpperCase()} File`, extensions: [file.extension] }]
>>>>>>> main
                })

                if (!dialogResult.canceled && dialogResult.filePath) {
                    fs.writeFile(dialogResult.filePath, file.data, (err) => {
                        if (err) { reject(err) }
                        resolve()
                    })
<<<<<<< HEAD
<<<<<<< HEAD
=======
                } else {
                    event.reply('file-canceled')
                    reject("Download cancelled")
>>>>>>> main
=======
                } else {
                    event.reply('file-canceled')
                    reject("Download cancelled")
>>>>>>> main
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