import { dialog, app } from "electron"
import fs from "fs"
import path from "path"
import { bSQLDB, regex } from "../utils"
import { formatToCSV } from "./helpers/adoptConv"
import { NoAdoption } from "../../types/Adoption"

export const adoptionProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-term-adoption':
            if (typeof data === "object" && data !== null && !Array.isArray(data)) {
                const [term, year] = regex.splitFullTerm(data["term"] as string)

                try {
                    const noAdoptions = await bSQLDB.adoptions.getNoAdoptionsByTerm(term, year)

                    event.reply('adoption-data', { noAdoptions, term: data["term"] })
                } catch (error) {
                    throw error
                }
            }
            break

        case 'download-csv':
            if (typeof data === "object" && data !== null && !Array.isArray(data)) {
                try {
                    const csv = formatToCSV(data["adoptions"] as NoAdoption[], data["term"] as string)

                    dialog.showSaveDialog({
                        defaultPath: path.join(app.getPath('downloads'), `AIP - ${regex.fileNameTimeStamp()}`),
                        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
                    })
                        .then(async (result) => {
                            if (!result.canceled && result.filePath) {
                                fs.writeFile(result.filePath, csv, (err) => {
                                    if (err) {
                                        throw "Unable to write CSV to selected path."
                                    }
                                    event.reply('download-success')
                                })
                            }
                        })
                } catch (error) {
                    throw error
                }
            }
    }
}