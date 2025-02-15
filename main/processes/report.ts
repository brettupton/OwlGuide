import Papa from 'papaparse'
import { dialog, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileManager, regex } from '../utils'
import { generateReport } from "./helpers/reportGen"

export const reportProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'request':
            // Typecheck that data is specifically an object and not any of types in JSObj
            if (typeof data === "object" && data !== null && !Array.isArray(data)) {
                const { isCsv, reqReports, reqTerms } = data
                // Initial array to hold finished reports by id
                const reportData: { id: string, report: DBRow[] }[] = []
                // Sort terms alphabetically
                const sortedTerms = (reqTerms as string[]).sort((a, b) => a.localeCompare(b))

                for (const report of reqReports as string[]) {
                    // Array for storing all report data sorted by term
                    const termReports = []
                    for (const term of sortedTerms) {
                        try {
                            const newReport = await generateReport(term, report)
                            termReports.push(...newReport)
                        } catch (error) {
                            throw error
                        }
                    }
                    reportData.push({ id: report, report: termReports })
                }
                if (isCsv as boolean) {
                    // Loops through all reports and downloads each under unique filename
                    for (const report of reportData) {
                        try {
                            const csv = Papa.unparse(report.report)
                            const reportName = report.id[0].toUpperCase() + report.id.substring(1)

                            dialog.showSaveDialog({
                                defaultPath: path.join(app.getPath('downloads'), `${reportName} Report - ${regex.fileNameTimeStamp()}`),
                                filters: [{ name: 'CSV File', extensions: ['csv'] }]
                            })
                                .then(async (result) => {
                                    if (!result.canceled && result.filePath) {
                                        fs.writeFile(result.filePath, csv, (err) => {
                                            if (err) {
                                                throw "Unable to write CSV to selected path."
                                            }

                                        })
                                    }
                                })
                        } catch (error) {
                            throw error
                        }
                    }
                } else {
                    for (const report of reportData) {
                        try {
                            const xlsx = await fileManager.xlsx.write(report.report)
                            const reportName = report.id[0].toUpperCase() + report.id.substring(1)

                            dialog.showSaveDialog({
                                defaultPath: path.join(app.getPath('downloads'), `${reportName} Report - ${regex.fileNameTimeStamp()}`),
                                filters: [{ name: 'XLSX File', extensions: ['xlsx'] }]
                            })
                                .then(async (result) => {
                                    if (!result.canceled && result.filePath) {
                                        fs.writeFile(result.filePath, xlsx, (err) => {
                                            if (err) {
                                                throw "Unable to write XLSX to selected path."
                                            }

                                        })
                                    }
                                })
                        } catch (error) {
                            throw error
                        }
                    }
                }
                event.reply('report-success')
            }
            break
    }
}