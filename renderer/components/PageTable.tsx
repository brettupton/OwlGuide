interface PageTableProps {
    pageData: { [field: string]: string }[]
    totalRows: number
    page: number
    updatePage: (newPage: number) => void
}

export default function PageTable({ pageData, totalRows, page, updatePage }: PageTableProps) {
    const headers = Object.keys(pageData[0])

    return (
        <div className="p-2">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-8rem)]">
                <table className="w-full text-sm text-left rtl:text-right text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {headers.map((header, index) => {
                                return (
                                    <th scope="col" className="p-2" key={index}>
                                        {header}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((row, index) => {
                            return (
                                <tr className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600" key={index}>
                                    {headers.map((header) => {
                                        return (
                                            <td className="p-2">
                                                {row[header]}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">Showing <span className="font-semibold text-white">{((page - 1) * 30) + 1}-{pageData.length * page}</span> of <span className="font-semibold text-white">{totalRows}</span></span>
                <div className="flex">
                    <button
                        onClick={() => updatePage(page - 1)}
                        className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium border rounded-lg  bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">
                        <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                        </svg>
                        Previous
                    </button>
                    <button
                        onClick={() => updatePage(page + 1)}
                        className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium border rounded-lg  bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">
                        Next
                        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>
                </div>
            </nav>
        </div>
    )
}