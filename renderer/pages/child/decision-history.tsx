import { useState, useEffect } from 'react'
import SalesTable from '../../components/SalesTable'
import { DBRow } from '../../../types/Database'

export default function DecisionSales() {
    const [history, setHistory] = useState<DBRow[]>([])

    useEffect(() => {
        window.ipc.on('history', (salesHistory: DBRow[]) => {
            const numTerms = salesHistory.length
            if (numTerms > 0) {
                let totalEnrl = 0
                let totalEst = 0
                let totalSales = 0
                let totalSE = 0
                // Calculate Sales/Enrl for each term
                // Calculate averages for each field
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
            setHistory(salesHistory)
        })
    }, [])

    return (
        <div className="mt-5 ml-1">
            {history.length > 0 ?
                <SalesTable sales={history} />
                :
                <div>No Prior Sales History For Term Specified</div>
            }
        </div>
    )
}