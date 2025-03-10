import { MutableRefObject } from "react"
import { Decision, TableTab } from "../../../types/Decision"

interface DecisionTableProps {
    decisions: Decision[]
    status: TableTab
    selectedTerm: string
    tableRef: MutableRefObject<HTMLTableElement>
    activeRow: number
    setActiveRow: (row: Decision) => void
    handleSort: (key: string) => void
}

export default function DecisionTable({ decisions, status, selectedTerm, tableRef, activeRow, setActiveRow, handleSort }: DecisionTableProps) {
    // Handle which data is shown based on status selection
    const filtered = decisions.filter(({ ActDiff }) => {
        if (status === 'All') return true
        if (status === 'GT5' && ActDiff >= 5) return true
        if (status === 'LT5' && ActDiff > 0 && ActDiff < 5) return true
        if (status === 'EQ0' && ActDiff === 0) return true

        return false
    })

    return (
        <div className="w-full">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-13rem)]">
                {decisions.length > 0 &&
                    <table className="w-full text-sm text-left rtl:text-right text-white" ref={tableRef}>
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                {Object.keys(decisions[0]).map((header) => {
                                    return (
                                        header === "Title" ?
                                            (
                                                <th className="px-1 py-2 flex justify-between" key={header}>
                                                    <div className="flex">
                                                        Title
                                                    </div>
                                                    <div className="flex">
                                                        <button onClick={() => handleSort("Title")} title="Sort Title">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </th>
                                            )
                                            :
                                            (
                                                header !== "ID" &&
                                                <th className="px-1 py-2" key={header}>{header}</th>
                                            )
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((decision) => {
                                return (
                                    <tr
                                        className={`${activeRow === decision["ID"] ? "bg-gray-600 border border-white ring-2 ring-white" : "bg-gray-800 border-b border-gray-700 hover:bg-gray-600"}`} key={`${decision["ID"]}`}
                                        onClick={() => setActiveRow(decision)}
                                    >
                                        {Object.keys(decision).map((key) => {
                                            return (
                                                key !== "ID" &&
                                                <td
                                                    className={`px-1 py-2 ${key === "Title" ? "min-w-[150px] max-w-[250px] overflow-hidden truncate whitespace-nowrap" : ""} ${typeof decision[key] === "number" && key !== "ISBN" ? "text-center" : ""}`}
                                                    key={`${decision["ID"]}-${key}`}
                                                    id={`${decision["ID"]}`}
                                                >
                                                    {decision[key]}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </div>
            <div className="text-xs text-end mt-1">
                {filtered.length} / {decisions.length}
            </div>
        </div>
    )
}