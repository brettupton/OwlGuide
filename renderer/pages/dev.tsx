import React, { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from 'react'
import { PageTable } from '../components'

export default function Development() {
    const [table, setTable] = useState<{ [field: string]: string }[]>([])
    const [tableName, setTableName] = useState<string>("")
    const [totalRows, setTotalRows] = useState<number>(0)
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(30)
    const [username, setUsername] = useState<string>("")

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)

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
            setPage(1)
            window.ipc.send('sql', { method: "get-table-page", data: { name: value, offset: 0, limit } })
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= Math.floor(totalRows / 30)) {
            window.ipc.send('sql', { method: "get-table-page", data: { name: tableName, offset: (newPage - 1), limit } })
            setPage(newPage)
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const newPaths: string[] = []
            for (const file of Array.from(e.currentTarget.files)) {
                newPaths.push(file.path)
            }

            window.ipc.send('sql', { method: "replace-table", data: newPaths })
        }
    }

    const handleTableDrop = () => {
        window.ipc.send('sql', { method: "drop-table" })
    }

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget

        setUsername(value)
    }

    const handleUsernameSubmit = () => {
        window.ipc.send('config', { method: "update", data: { 'username': username } })
    }

    const handleUserGet = () => {
        window.ipc.send('config', { method: "get", data: 'username' })
    }

    const handleReset = () => {
        if (document.getElementById('csv')) {
            (document.getElementById('csv') as HTMLInputElement).value = ""
        }
        setTable([])
        setTableName("")
        setTotalRows(0)
        setPage(1)
        setUsername("")
    }

    return (
        <div className="flex flex-col mt-5 pl-2 w-full mx-auto">
            <div className="flex">
                <button onClick={handleReset}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </div>
            {table.length <= 0
                ?
                <div className="flex flex-col mt-3 gap-3">
                    <div className="flex">
                        <select
                            id="tables"
                            className="border text-sm rounded-lg block p-1 bg-gray-700 border-gray-600 text-white"
                            onChange={handleTableChoice}
                            defaultValue={tableName}>
                            <option value="">Select</option>
                            <option>Courses</option>
                            <option>Books</option>
                            <option>Sales</option>
                            <option>Course_Book</option>
                        </select>
                    </div>
                    <div className="flex">
                        <input type="file" id="csv" multiple onChange={handleFileChange} />
                    </div>
                    <div className="flex w-full h-1/2">
                        <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleTableDrop}>Drop</button>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex">
                            <input type="text" className="rounded text-black p-1" placeholder="Username" onChange={handleUsernameChange} />
                        </div>
                        <div className="flex mt-2">
                            <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleUsernameSubmit}>Submit</button>
                        </div>
                    </div>
                    <div className="flex">
                        <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleUserGet}>Get</button>
                    </div>
                </div>
                :
                <div className="flex flex-col">
                    <div className="flex">
                        <select
                            id="tables"
                            className="border text-sm rounded-lg block w-full p-1 bg-gray-700 border-gray-600 text-white"
                            onChange={handleTableChoice}
                            defaultValue={tableName}>
                            <option value="">Select</option>
                            <option>Courses</option>
                            <option>Books</option>
                            <option>Sales</option>
                            <option>Course_Book</option>
                        </select>
                    </div>
                    <PageTable
                        pageData={table}
                        totalRows={totalRows}
                        page={page}
                        limit={limit}
                        updatePage={handlePageChange}
                        tableRef={tableRef}
                    />
                </div>
            }
        </div>
    )
}