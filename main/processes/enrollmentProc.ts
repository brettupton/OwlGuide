<<<<<<< HEAD
import { config } from "../utils"
import { initialMatch, submitEnrollment } from "./helpers/enrlmntFile"
import { downloadFiles } from "../electron-utils/download-file"
=======
import { config, regex } from "../utils"
import { fetchBannerCourses, fetchBannerTerms, initialMatch, submitEnrollment } from "./helpers/enrlmntFile"
import { downloadFiles } from "../electron-utils/download-file"
import { BrowserWindow } from "electron"
>>>>>>> main

export const enrollmentProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "enrollment") {
        switch (method) {
            case 'file-upload':
                try {
                    const filePath: string = data["fileArr"][0]
                    const enrollment = await initialMatch(filePath)

                    // Write filepath to config for later retrieval
                    await config.write([['enrollmentPath', filePath]])
                    event.reply('data', { enrollment })
                } catch (error) {
                    throw error
                }
                break

            case 'file-download':
                try {
                    const prevFile = await config.read('enrollmentPath', false)
                    const { fileName, csv } = await submitEnrollment(data["enrollment"], prevFile)

                    await downloadFiles(event, "enrollment", [{ data: csv, extension: "csv", name: fileName }])
                } catch (error) {
                    throw error
                }
                break
<<<<<<< HEAD
=======

            case 'get-api-terms':
                try {
                    const terms = await fetchBannerTerms()

                    event.reply('terms-data', { terms })
                } catch (error) {
                    throw error
                }
                break

            case 'get-api-sections':
                try {
                    // Pass electron window for ability to update progress bar on renderer
                    const courses = await fetchBannerCourses(BrowserWindow.fromId(event.sender.id), data["term"]["code"])

                    await downloadFiles(event, "enrollment", [{ data: courses, extension: "csv", name: `${data["term"]["description"]} Enrollment - ${regex.fileNameTimeStamp()}` }])
                } catch (error) {
                    throw error
                }
>>>>>>> main
        }
    }
}