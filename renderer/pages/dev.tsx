import React, { ChangeEvent, useEffect, useState } from 'react'
import PageTable from '../components/PageTable'

export default function Development() {
    const [table, setTable] = useState<{ [field: string]: string }[]>([])
    const [tableName, setTableName] = useState<string>("")
    const [totalRows, setTotalRows] = useState<number>(0)
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(30)

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('table-page', (reply: { rows: { [field: string]: string }[], total: number }) => {
                setTable(reply.rows)
                setTotalRows(reply.total)
            })
        }
    }, [])

    const handleTableChoice = (e: ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.currentTarget

        if (value) {
            setTableName(value)
            window.ipc.send('sql', { method: "get-table-page", data: { name: value, offset: (page - 1), limit } })
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= Math.floor(totalRows / 30)) {
            window.ipc.send('sql', { method: "get-table-page", data: { name: tableName, offset: (newPage - 1), limit } })
            setPage(newPage)
        }
    }

    return (
        <div className="flex flex-col mt-5">
            {table.length > 0
                ?
                <PageTable pageData={table} totalRows={totalRows} page={page} updatePage={handlePageChange} />
                :
                <div className="max-w-sm mx-auto">
                    <label htmlFor="tables" className="block mb-2 text-sm font-medium text-white">Table</label>
                    <select id="tables" className="border text-sm rounded-lg block w-full p-1 bg-gray-700 border-gray-600 text-white" onChange={handleTableChoice}>
                        <option value="">Select</option>
                        <option>Courses</option>
                        <option>Books</option>
                        <option>Sales</option>
                        <option>Course_Book</option>
                    </select>
                </div>
            }
        </div>
    )
}