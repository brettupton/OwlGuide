import { IpcMainEvent } from 'electron'
import { TXTService } from './'
import { convertTitleCase, fetchBookData } from "../electron-utils/dev"
import Sales from '../../types/Sales'
import { Book, Semester } from "../../types/Book"

export class DevService {
    public fileData: string[]
    public headerIndices: number[]

    constructor(filePath?: string) {
        const txtService = new TXTService(filePath)
        this.fileData = txtService.readFileData()
        this.headerIndices = txtService.headerIndices
    }

    public addNewSales = async (data: string[], headerIndices: number[], event: IpcMainEvent): Promise<Sales> => {
        const BATCH_SIZE = 200
        const newSales: { [ISBN: string]: Book } = {}

        data.forEach(line => {
            const [
                Term,
                Course,
                Section,
                rawProfessor,
                rawISBN,
                rawEstEnrl,
                rawActEnrl,
                rawEstSales,
                rawReorders,
                rawActSales
            ] = headerIndices.map((start, i) => line.substring(start, headerIndices[i + 1]).trim())

            const Professor = rawProfessor === "TBD" ? rawProfessor : convertTitleCase(rawProfessor)
            const ISBN = rawISBN.replace(/-/g, '')
            const EstEnrl = parseInt(rawEstEnrl) || 0
            const ActEnrl = parseInt(rawActEnrl) || 0
            const EstSales = parseInt(rawEstSales) || 0
            const Reorders = parseInt(rawReorders) || 0
            const ActSales = parseInt(rawActSales) || 0

            if (ISBN.startsWith('822') || ISBN.includes("** E BOOK **") || ISBN.includes("None")) {
                return
            }

            if (newSales[ISBN]) {
                // ISBN exists, check if term exists already
                if (!newSales[ISBN].semesters[Term]) {
                    newSales[ISBN].semesters[Term] = {
                        courses: [{ course: `${Course} ${Section}`, professor: Professor }],
                        est_enrl: EstEnrl,
                        act_enrl: ActEnrl,
                        est_sales: EstSales,
                        act_sales: ActSales,
                        reorders: Reorders
                    }
                    if (Course.includes('SPEC') || Course.includes('CANC')) {
                        return
                    } else {
                        newSales[ISBN].total_est_enrl += EstEnrl
                        newSales[ISBN].total_act_enrl += ActEnrl
                        newSales[ISBN].total_est_sales += EstSales
                        newSales[ISBN].total_act_sales += ActSales
                        newSales[ISBN].total_reorders += Reorders
                    }
                } else {
                    newSales[ISBN].semesters[Term].courses.push({ course: `${Course} ${Section}`, professor: Professor })
                }
            } else {
                newSales[ISBN] = {
                    semesters: {
                        [Term]: {
                            courses: [{ course: `${Course} ${Section}`, professor: Professor }],
                            est_enrl: EstEnrl,
                            act_enrl: ActEnrl,
                            est_sales: EstSales,
                            act_sales: ActSales,
                            reorders: Reorders
                        }
                    },
                    total_est_enrl: EstEnrl,
                    total_act_enrl: ActEnrl,
                    total_est_sales: EstSales,
                    total_act_sales: ActSales,
                    total_reorders: Reorders
                }
                if (Course.includes('SPEC') || Course.includes('CANC')) {
                    newSales[ISBN].total_est_enrl = 0,
                        newSales[ISBN].total_act_enrl = 0,
                        newSales[ISBN].total_est_sales = 0,
                        newSales[ISBN].total_act_sales = 0,
                        newSales[ISBN].total_reorders = 0
                }
            }
        })
        const sorted = this.sortSalesData(newSales)

        // Batch through all ISBNs to not overload API, send progress to render process
        const allISBNs = Object.keys(sorted)
        const totalBatches = Math.ceil(allISBNs.length / BATCH_SIZE)

        for (let i = 0; i < totalBatches; i++) {
            const start = i * BATCH_SIZE
            const end = start + BATCH_SIZE
            const batchPromises = allISBNs.slice(start, end).map(async (ISBN) => {
                const bookData = await fetchBookData(ISBN, sorted[ISBN])
                sorted[ISBN] = { ...bookData }
            })

            await Promise.all(batchPromises)
            const progress = (((i + 1) / totalBatches) * 100).toFixed(0)

            event.sender.send('progress-update', progress)
        }
        event.sender.send('progress-update', 100)
        return sorted
    }

    private sortSalesData = (newSales: Sales): Sales => {
        for (const isbn in newSales) {
            const sortedTerms = Object.keys(newSales[isbn].semesters).sort()

            const sortedSemesters: { [term: string]: Semester } = {}
            for (const term of sortedTerms) {
                sortedSemesters[term] = newSales[isbn].semesters[term]
            }

            newSales[isbn].semesters = sortedSemesters

            for (const term in newSales[isbn].semesters) {
                const semester = newSales[isbn].semesters[term]
                semester.courses.sort((a, b) => a.course.localeCompare(b.course))
            }
        }

        return newSales
    }
}