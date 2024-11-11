interface SalesTableProps {
    sales: DBRow[]
}

export default function SalesTable({ sales }: SalesTableProps) {
    const fields = Object.keys(sales[0])

    return (
        <div className="flex flex-col">
            <div className="mx-2 relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-7.5rem)]">
                <table className="w-full text-sm text-left rtl:text-right text-white">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {fields.map((header, index) => {
                                return (
                                    header !== "ISBN" && header !== "Title" &&
                                    <th scope="col" className={`p-2 ${typeof (sales[0][header]) === "number" ? "text-center" : ""}`} key={index}>
                                        {header}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((row, index) => {
                            return (
                                <tr className={`${sales[index]["Term"] === "Avg" ? 'bg-gray-400 border border-gray-700' : 'bg-gray-800 hover:bg-gray-600 border-b border-gray-700'}`} key={index}>
                                    {fields.map((field) => {
                                        return (
                                            field !== "ISBN" && field !== "Title" &&
                                            <td className={`p-2 ${typeof (row[field]) === "number" ? "text-center" : ""}`}>
                                                {row[field]}
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