import { Book } from "../../types/Book"

interface SalesTableProps {
    ISBN: string
    Term: string
    book: Book
}

export default function SalesTable({ ISBN, Term, book }: SalesTableProps) {
    const years = [15, 16, 17, 18, 19, 20, 21, 22, 23]

    const numSemesters = Object.keys(book.semesters).length
    const averageEnrl = numSemesters > 0 ? (book.total_act_enrl / numSemesters).toFixed(0) : ""
    const averageSales = numSemesters > 0 ? (book.total_act_sales / numSemesters).toFixed(0) : ""

    return (
        <>
            <div className="italic">{ISBN}</div>
            <div className="truncate italic">{book.title}</div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-2rem)]">
                <table className="w-full sm:text-xs rtl:text-right">
                    <thead className="text-gray-200 uppercase border-b bg-gray-600 text-xs">
                        <tr>
                            <th scope="col" className="px-2 py-1">
                                Term
                            </th>
                            <th scope="col" className="px-2 py-1">
                                Est Enrl
                            </th>
                            <th scope="col" className="px-2 py-1">
                                Est Sales
                            </th>
                            <th scope="col" className="px-2 py-1 ">
                                Act Enrl
                            </th>
                            <th scope="col" className="px-2 py-1">
                                Act Sales
                            </th>
                            <th scope="col" className="px-2 py-1">
                                Reo
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {years.map((year, key) => {
                            const term = Term + year
                            return (
                                <tr className="border-b border-white text-gray-200 font-semibold text-center" key={key}>
                                    <td className="px-2 py-2.5 border-r">
                                        {term}
                                    </td>
                                    <td className="px-2">
                                        {book.semesters[term]?.est_enrl ?? ""}
                                    </td>
                                    <td className="px-2 border-r">
                                        {book.semesters[term]?.est_sales ?? ""}
                                    </td>
                                    <td className="px-2">
                                        {book.semesters[term]?.act_enrl ?? ""}
                                    </td>
                                    <td className="px-2 border-r">
                                        {book.semesters[term]?.act_sales ?? ""}
                                    </td>
                                    <td className="px-2">
                                        {book.semesters[term]?.reorders ?? ""}
                                    </td>
                                </tr>
                            )
                        })}
                        <tr className="border-b border-white text-gray-200 font-semibold text-center">
                            <td className="px-2">
                                Avg
                            </td>
                            <td className="px-2">

                            </td>
                            <td className="px-2">

                            </td>
                            <td className="px-2">
                                {averageEnrl}
                            </td>
                            <td className="px-2">
                                {averageSales}
                            </td>
                            <td className="px-2">

                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}