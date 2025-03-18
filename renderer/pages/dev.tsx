import React, { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Development() {
    const router = useRouter()

    useEffect(() => {
        window.ipc.on('config-data', ({ config }: Config) => {
            console.log(config)
        })

        window.ipc.on('update-success', () => {
            router.refresh()
        })
    }, [])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const newPaths: string[] = []

            for (const file of Array.from(e.currentTarget.files)) {
                newPaths.push(file.path)
            }

            window.ipc.send('main', { process: 'sql', method: "update-db-manual", data: { files: newPaths } })
        }
    }

    const handleOpenUserPath = () => {
        window.ipc.send('dev', { method: 'open-user-dir' })
    }

    const handleDBRecreate = () => {
        window.ipc.send('main', { process: 'sql', method: 'recreate-db' })
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
    }

    const handleDumpFiles = () => {
        window.ipc.send('dev', { method: 'dump-files' })
<<<<<<< HEAD
>>>>>>> main
=======
    }

    const handleLogStatements = () => {
        window.ipc.send('dev', { method: 'log-statement' })
>>>>>>> main
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
                    <span className="underline underline-offset-8">Database</span>
                </div>
                <div className="flex">
                    <input type="file" id="csv" multiple onChange={handleFileChange} />
                </div>
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleDBRecreate}>Recreate</button>
                </div>
                <div className="flex">
<<<<<<< HEAD
=======
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleLogStatements}>Statements</button>
                </div>
                <div className="flex">
>>>>>>> main
                    <span className="underline underline-offset-8">Directory</span>
                </div>
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleOpenUserPath}>Open</button>
                </div>
<<<<<<< HEAD
<<<<<<< HEAD
=======
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleDumpFiles}>Dump</button>
                </div>
>>>>>>> main
=======
                <div className="flex">
                    <button className="border border-white rounded px-3 hover:bg-gray-500" onClick={handleDumpFiles}>Dump</button>
                </div>
>>>>>>> main
            </div>
        </div>
    )
}