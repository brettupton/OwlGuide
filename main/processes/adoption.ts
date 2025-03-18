import { dialog, app } from "electron"
import fs from "fs"
import path from "path"
import { bSQLDB, regex } from "../utils"
import { formatToCSV } from "./helpers/adoptConv"
import { NoAdoption } from "../../types/Adoption"
import { downloadFiles } from "../electron-utils/download-file"

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
                    console.log(data["adoptions"])
                    const csv = formatToCSV(data["adoptions"] as NoAdoption[], data["term"] as string)
                    const csvFiles = csv.map((file) => { return { data: file, extension: "csv" } })

                    await downloadFiles(event, "AIP", csvFiles)
                } catch (error) {
                    throw error
                }
            }
    }
}