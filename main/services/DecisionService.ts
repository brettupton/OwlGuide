import fs from 'fs'
import path from 'path'
import { TXTService } from "./"
import Sales from '../../types/Sales'
import Decision from '../../types/Decision'

interface BDReturn {
    newBD: Decision[]
    term: string
}

export class DecisionService {
    private txtService: TXTService
    public term: string

    constructor(filePath: string) {
        this.txtService = new TXTService(filePath)
    }

    public getNewBD(): Promise<BDReturn> {
        return new Promise(async (resolve, reject) => {
            try {
                const { fileData, headerData, term } = await this.txtService.readFileData()
                // Sort header terms by their indices
                const sortedIndices = Object.keys(headerData).map(Number).sort((a, b) => a - b)
                const newBD = []
                const prevSalesPath: string = path.join(__dirname, '..', 'resources', 'stores', `${global.store}`, 'sales', `${term}.json`)

                fs.readFile(prevSalesPath, 'utf8', (err, prevSales) => {
                    if (err) {
                        reject(`Something went wrong reading past sales for store ${global.store}`)
                    }
                    const allPrevSales: Sales = JSON.parse(prevSales)
                    fileData.forEach(line => {
                        const [Title, rawISBN, rawDecision, rawEnrollment] = sortedIndices.map((start, i) => {
                            // Determine end index for current term
                            const end = sortedIndices[i + 1] || line.length
                            return line.substring(start, end).trim()
                        })

                        const ISBN = rawISBN.replace(/-/g, '')
                        const Enrollment = parseInt(rawEnrollment)
                        const Decision = parseInt(rawDecision)
                        let avgSE = 0

                        if (ISBN.startsWith('822') || ISBN === 'None' || Title.startsWith('EBK')) {
                            return
                        }

                        if (allPrevSales[ISBN]) {
                            const prevSemester = Object.keys(allPrevSales[ISBN]["semesters"]).slice(-1)[0]
                            const prevSemesterEnrl: number = allPrevSales[ISBN]["semesters"][prevSemester]["act_enrl"]
                            const prevSemesterSales: number = allPrevSales[ISBN]["semesters"][prevSemester]["act_sales"]

                            if (allPrevSales[ISBN].total_act_enrl - prevSemesterEnrl === 0) {
                                // Only one semester of previous data, skip weighted average calculation
                                avgSE = allPrevSales[ISBN].total_act_sales / allPrevSales[ISBN].total_act_enrl || 0
                            } else {
                                // Subtract previous sales from total and get new average
                                const newAvgSE = (allPrevSales[ISBN].total_act_sales - prevSemesterSales) / (allPrevSales[ISBN].total_act_enrl - prevSemesterEnrl) || 0
                                const prevTermAvgSE = prevSemesterSales / prevSemesterEnrl || 0

                                const alpha = 0.5
                                // Exponential Smoothing
                                avgSE = (1 - alpha) * newAvgSE + alpha * prevTermAvgSE
                            }
                        } else {
                            // No past sales data, divide enrollment by 1/5
                            avgSE = 0.2
                        }

                        const newCalc = term === "A" ? Math.max(1, Math.ceil(avgSE * Enrollment)) : Math.ceil(avgSE * Enrollment)

                        const newBook = {
                            ISBN: ISBN,
                            Title: Title,
                            Enrollment: Enrollment,
                            oldDecision: Decision,
                            newDecision: newCalc,
                            Difference: Math.abs(Decision - newCalc)
                        }

                        if (!(newBD.some(book => book.ISBN === newBook.ISBN))) {
                            newBD.push(newBook)
                        }
                    })
                    resolve({ newBD, term })
                })
            } catch (err) {
                console.error(err)
                reject("Something went wrong creating new buying decision.")
            }
        })
    }
}