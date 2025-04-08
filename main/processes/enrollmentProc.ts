import { config } from "../utils"
import { initialMatch, submitEnrollment } from "./helpers/enrlmntFile"
import { downloadFiles } from "../electron-utils/download-file"

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
        }
    }
}