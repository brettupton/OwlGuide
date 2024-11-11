import { useState, useEffect } from 'react'
import { Spinner, SalesTable } from "../../components"
import CoursesTable from '../../components/tables/CoursesTable'

type DecisionData = {
    history: DBRow[]
    courses: DBRow[]
    book: {
        isbn: string
        title: string
    }
}

export default function DecisionData() {
    const [data, setData] = useState<DecisionData>()

    useEffect(() => {
        window.ipc.on('data', ({ salesHistory, courses, isbn, title }: { salesHistory: DBRow[], courses: DBRow[], isbn: string, title: string }) => {
            const numTerms = salesHistory.length
            if (numTerms > 0) {
                let totalEnrl = 0
                let totalEst = 0
                let totalSales = 0
                let totalSE = 0
                // Calculate Sales/Enrl for each term and averages for each field
                salesHistory.forEach((term) => {
                    const SE = (term["ActEnrl"] as number) !== 0 ? ((term["Sales"] as number) / (term["ActEnrl"] as number)) : 0
                    term["S/E"] = SE !== 0 ? SE.toFixed(3) : 0
                    totalEnrl += (term["ActEnrl"] as number)
                    totalEst += (term["EstEnrl"] as number)
                    totalSales += (term["Sales"] as number)
                    totalSE += SE
                })
                salesHistory.push({
                    "ISBN": 0,
                    "Title": "",
                    "Term": "Avg",
                    "EstEnrl": Math.round(totalEst / numTerms) ?? 0,
                    "ActEnrl": Math.round(totalEnrl / numTerms) ?? 0,
                    "Sales": Math.round(totalSales / numTerms) ?? 0,
                    "S/E": totalSE / numTerms !== 0 ? (totalSE / numTerms).toFixed(3) : 0
                })
            }
            setData({
                history: salesHistory,
                courses,
                book: {
                    isbn,
                    title
                }
            })
        })
    }, [])

    return (
        <div className="mt-5 ml-1">
            {
                data && Object.keys(data).length > 0
                    ?
                    <div className="flex flex-col">
                        <div className="flex flex-col m-2">
                            <div className="flex">
                                {data.book.isbn}
                            </div>
                            <div className="flex">
                                {data.book.title.length > 28 ? data.book.title.slice(0, 27) + "..." : data.book.title}
                            </div>
                        </div>
                        {data.history.length > 0
                            ?
                            <SalesTable sales={data.history} />
                            :
                            <div>No Prior History for Title</div>
                        }
                        {data.courses.length > 0
                            ?
                            <CoursesTable courses={data.courses} />
                            :
                            <div>No Course Data Available</div>
                        }
                    </div>
                    :
                    <div>
                        <Spinner />
                    </div>
            }
        </div>
    )
}