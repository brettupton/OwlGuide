import { bSQLDB, regex } from "../utils"
import { formatToCSV } from "./helpers/adoptConv"
import { downloadFiles } from "../electron-utils/download-file"

export const adoptionProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "adoption") {
        switch (method) {
            case 'get-term-adoption':
                const [term, year] = regex.splitFullTerm(data["term"])

                try {
                    const noAdoptions = await bSQLDB.adoptions.getNoAdoptionsByTerm(term, year)

                    event.reply('adoption-data', { noAdoptions, term: data["term"] })
                } catch (error) {
                    throw error
                }
                break

            case 'download-csv':
                try {
                    const csv = formatToCSV(data["adoptions"], data["term"])
                    const csvFiles = csv.map((file) => { return { data: file, extension: "csv" } })

                    await downloadFiles(event, "AIP", csvFiles)
                } catch (error) {
                    throw error
                }
        }
    }
}