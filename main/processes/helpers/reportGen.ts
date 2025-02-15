import { bSQLDB, regex } from "../../utils"

const generateReport = async (termYear: string, reportId: string) => {
    try {
        const [term, year] = regex.splitFullTerm(termYear)
        const report = await bSQLDB.reports[reportId](term, year) as DBRow[]

        return report
    } catch (error) {
        throw error
    }
}

export { generateReport }