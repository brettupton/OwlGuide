import { MutableRefObject } from "react"
import { Decision, TableTab } from "../../../types/Decision"

interface DecisionTableProps {
    data: Decision[]
    handleRowClick: (isbn: string, title: string) => void
    activeBook: { ISBN: string, Title: string }
    activeTab: TableTab
    tableRef: MutableRefObject<HTMLTableElement>
}

export default function DecisionTable({ data, handleRowClick, activeBook, activeTab, tableRef }: DecisionTableProps) {
    const fields = Object.keys(data[0])
    // Handle which data is shown based on tab selection
    const filtered = data.filter(({ Diff }) => {
        if (activeTab === 'All') return true
        if (activeTab === 'GT5' && Diff >= 5) return true
        if (activeTab === 'LT5' && Diff > 0 && Diff < 5) return true
        if (activeTab === 'EQ0' && Diff === 0) return true
        return false
    })

    return (
        <div className="flex flex-col mx-2">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-8.5rem)]">
                <table className="w-full text-sm text-left rtl:text-right text-white" ref={tableRef}>
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {fields.map((header, index) => {
                                return (
                                    <th scope="col" className="p-2" key={index}>
                                        {header}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row, index) => {
                            return (
                                <tr
                                    className={`${activeBook && activeBook.ISBN === row["ISBN"] && activeBook.Title === row["Title"] ? 'bg-gray-400' : 'bg-gray-800'} border-b border-gray-700 hover:bg-gray-600`}
                                    onClick={() => handleRowClick(row["ISBN"] as string, row["Title"])}
                                    key={index}
                                >
                                    {fields.map((field) => {
                                        return (
                                            <td key={`${row}${index}-${field}`}
                                                className={`p-2 ${typeof (row[field]) === "number" && field !== "ISBN" ? "text-center" : ""}`}
                                            >
                                                {row[field].length > 34 ? row[field].slice(0, 33) + "..." : row[field]}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end text-sm">{filtered.length} / {data.length}</div>
        </div>
    )
}