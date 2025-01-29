import React, { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Development() {
    const [writeKey, setWriteKey] = useState<string>("")
    const [writeValue, setWriteValue] = useState<string>("")
    const [readKey, setReadKey] = useState<string>("")
    const [deleteKey, setDeleteKey] = useState<string>("")

    const router = useRouter()

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const newPaths: string[] = []

            for (const file of Array.from(e.currentTarget.files)) {
                newPaths.push(file.path)
            }

            window.ipc.send('main', { process: 'sql', method: "update-db", data: { files: newPaths } })
        }
    }

    const handleWorkerWin = () => {
        window.ipc.send('acs')
    }

    const handleKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget
        setWriteKey(value)
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget
        setWriteValue(value)
    }

    const handleReadKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget
        setReadKey(value)
    }

    const handleDelKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget
        setDeleteKey(value)
    }

    const handleConfigSubmit = () => {
        window.ipc.send('config', { method: 'write', data: { key: writeKey, value: writeValue } })
    }

    const handleConfigRead = () => {
        window.ipc.send('config', { method: 'read', data: { key: readKey } })
    }

    const handleConfigDelete = () => {
        window.ipc.send('config', { method: 'delete', data: { key: deleteKey } })
    }


    const handleReset = () => {
        router.refresh()
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
            <div className="flex flex-col mt-3 gap-3">
                <div className="flex">
                    <input type="file" id="csv" multiple onChange={handleFileChange} />
                </div>
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleWorkerWin}>ACS</button>
                </div>
                <div className="flex">
                    <span className="underline underline-offset-8">Config</span>
                </div>
                <div className="flex w-1/4">
                    <input
                        placeholder="Key"
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                        onChange={handleReadKeyChange} />
                </div>
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleConfigRead}>Read</button>
                </div>
                <div className="flex w-1/4">
                    <input
                        placeholder="Key"
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                        onChange={handleDelKeyChange} />
                </div>
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleConfigDelete}>Delete</button>
                </div>
                <div className="flex">
                    <div className="flex">
                        <input
                            placeholder="Key"
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                            onChange={handleKeyChange} />
                    </div>
                    <div className="flex">
                        <input
                            placeholder="Value"
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                            onChange={handleValueChange} />
                    </div>
                </div>
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleConfigSubmit}>Write</button>
                </div>
            </div>
        </div>
    )
}