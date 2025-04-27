import { downloadFiles } from "../../electron-utils"
import { bSQLDB, fileHandler, regex } from "../../utils"
import Papa from 'papaparse'

const generateReports = async (event: Electron.IpcMainEvent, reqCSV: boolean, reqReports: string[], reqTerms: string[]) => {
    const parsedFiles: { name: string, extension: string, data: string | Buffer<ArrayBufferLike> }[] = []

    for (const reportId of reqReports) {
        for (const reqTerm of reqTerms) {
            const [term, year] = regex.splitFullTerm(reqTerm)
            try {
                const reportData = await bSQLDB.reports[reportId](term, year) as DBRow[]
                const parsedData = reqCSV ? Papa.unparse(reportData) : await fileHandler.xlsx.write(reportData)

                parsedFiles.push({ name: `${reqTerm} ${reportId.toUpperCase()} - ${regex.fileNameTimeStamp()}`, extension: reqCSV ? "csv" : "xlsx", data: parsedData })
            } catch (error) {
                throw error
            }
        }
    }

    await downloadFiles(event, "report", parsedFiles)
}

export { generateReports }