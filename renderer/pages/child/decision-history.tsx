import { useState, useEffect } from 'react'
import SalesTable from '../../components/SalesTable'

export default function DecisionSales() {
    const [history, setHistory] = useState<any[]>([])

    useEffect(() => {
        window.ipc.on('history', (salesHistory: any[]) => {
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