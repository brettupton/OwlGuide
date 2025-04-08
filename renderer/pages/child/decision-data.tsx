import { useState, useEffect } from 'react'
import { Spinner, SalesTable, CoursesTable } from "../../components"
import { DecisionSales } from '../../../types/Decision'

type BookData = {
    ISBN: string
    Title: string
    History: DecisionSales[]
    Courses: DBRow[]
}

export default function DecisionData() {
    const [bookData, setBookData] = useState<BookData>()

    useEffect(() => {
        window.ipc.send('ready-to-receive')

        window.ipc.on('data', ({ salesHistory, courses, ISBN, Title }: { salesHistory: DecisionSales[], courses: DBRow[], ISBN: string, Title: string }) => {
            const updatedHistory = calculateSalesHistory(salesHistory)

            setBookData({
                ISBN,
                Title,
                History: updatedHistory,
                Courses: courses
            })
        })
    }, [])

    const calculateSalesHistory = (salesHistory: DecisionSales[]): DecisionSales[] => {
        if (!salesHistory || salesHistory.length === 0) return salesHistory

        let totalEnrl = 0
        let totalEst = 0
        let totalSales = 0
        let totalSE = 0

        const updatedHistory: DecisionSales[] = salesHistory.map((term) => {
            const actEnrl = term["ActEnrl"] as number
            const sales = term["Sales"] as number
            const SE = actEnrl !== 0 ? sales / actEnrl : 0

            totalEnrl += actEnrl
            totalEst += (term["EstEnrl"] as number)
            totalSales += sales
            totalSE += SE

            return {
                ...term,
                "S/E": SE !== 0 ? SE.toFixed(3) : 0
            }
        })

        const numTerms = salesHistory.length
        updatedHistory.push({
            "Term": "Avg",
            "EstEnrl": Math.round(totalEst / numTerms) || 0,
            "ActEnrl": Math.round(totalEnrl / numTerms) || 0,
            "Sales": Math.round(totalSales / numTerms) || 0,
            "S/E": totalSE / numTerms !== 0 ? (totalSE / numTerms).toFixed(3) : 0,
        })

        return updatedHistory
    }

    return (
        <div className="flex flex-col h-full px-1 border border-t-[42px] rounded-2xl border-gray-800">
            {bookData ?
                <div className="flex flex-col w-full p-2 h-full">
                    <div className="flex flex-col">
                        <div className="flex font-semibold overflow-hidden truncate whitespace-nowrap">
                            {bookData.Title}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                            <span className="font-semibold">ISBN:</span> {bookData.ISBN}
                        </div>
                    </div>
                    <div className="flex flex-col h-5/6">
                        <div className="flex h-1/2">
                            <CoursesTable courses={bookData.Courses} />
                        </div>
                        <div className="flex h-1/2">
                            {bookData.History.length > 0 ?
                                <SalesTable sales={bookData.History} />
                                :
                                <p className="font-semibold text-sm">No Previous History</p>
                            }
                        </div>
                    </div>
                </div>
                :
                <Spinner
                    size="md"
                    color="white"
                />
            }
        </div>
    )
}