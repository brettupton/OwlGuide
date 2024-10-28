import { Decision } from "../../types/Decision"

interface DecisionTableProps {
    data: Decision[]
    term: string
    handleRowClick: (isbn: string, title: string) => void
    activeBook: { ISBN: string, Title: string }
}

export default function DecisionTable({ data, term, handleRowClick, activeBook }: DecisionTableProps) {
    const fields = Object.keys(data[0])
    return (
        <div className="flex flex-col">
            <div className="flex mx-3 my-1 gap-1 text-sm">
                Term: {term}
            </div>
            <div className="mx-2 relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-7.5rem)]">
                <table className="w-full text-sm text-left rtl:text-right text-white">
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
                        {data.map((row, index) => {
                            return (
                                <tr
                                    className={`${activeBook && activeBook.ISBN === row["ISBN"] && activeBook.Title === row["Title"] ? 'bg-gray-400' : 'bg-gray-800'} border-b border-gray-700 hover:bg-gray-600`}
                                    key={index}
                                    onClick={() => handleRowClick(row["ISBN"], row["Title"])}
                                >
                                    {fields.map((field) => {
                                        return (
                                            <td className={`p-2 ${typeof (row[field]) === "number" && field !== "ISBN" ? "text-center" : ""}`}>
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
        </div>
    )
}