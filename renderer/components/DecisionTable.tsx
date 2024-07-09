import { MutableRefObject } from "react"
import Decision from "../../types/Decision"

interface DecisionTableProps {
    BDData: Decision[]
    activeTab: string
    handleISBNClick: (isbn: string) => void
    SalesTableRef: MutableRefObject<any>
}

export default function DecisionTable({ BDData, activeTab, handleISBNClick, SalesTableRef }: DecisionTableProps) {
    const filteredBDData = BDData.filter(({ Difference }) => {
        if (activeTab === 'All') return true
        if (activeTab === 'QT5' && Difference > 5) return true
        if (activeTab === 'LT5' && Difference > 0 && Difference < 5) return true
        if (activeTab === 'EQ0' && Difference === 0) return true
        return false
    })

    const rowClass = (diff: number) =>
        `border-b border-white text-gray-200 font-semibold ${diff === 0
            ? "bg-gradient-to-r from-green-200 to-green-300 text-green-800 hover:text-green-600"
            : diff < 5
                ? "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800 hover:text-yellow-600"
                : "bg-gradient-to-r from-red-200 to-red-300 text-red-800 hover:text-red-600"
        }`

    return (
        <>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-9.6rem)]">
                <table className="w-full sm:text-sm lg:text-md text-left rtl:text-right" ref={SalesTableRef}>
                    <thead className="text-gray-200 uppercase border-b bg-gray-600 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                ISBN
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Enrl
                            </th>
                            <th scope="col" className="px-6 py-3 ">
                                Old
                            </th>
                            <th scope="col" className="px-6 py-3">
                                New
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBDData.map((book, key) => {
                            return (
                                <tr className={rowClass(book.Difference)} key={key} onClick={() => handleISBNClick(book.ISBN)}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {book.ISBN}
                                    </td>
                                    <td className="px-6 py-4 truncate">
                                        {book.Title}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {book.Enrollment}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {book.oldDecision}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {book.newDecision}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end px-2 py-1 sm:text-sm lg:text-lg">{filteredBDData.length} / {Object.keys(BDData).length}</div>
        </>
    )
}