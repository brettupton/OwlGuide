import React, { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '../components/Spinner'
import { Button } from '../components/Button'

export default function Development() {
    const router = useRouter()

    useEffect(() => {
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

            window.ipc.send('main', { process: 'sql', method: "update-db-manual", data: { type: 'sql', files: newPaths } })
        }
    }

    const handleOpenUserPath = () => {
        window.ipc.send('dev', { method: 'open-user-dir' })
    }

    const handleDBRecreate = () => {
        window.ipc.send('main', { process: 'sql', method: 'recreate-db' })
    }

    const handleDumpFiles = () => {
        window.ipc.send('dev', { method: 'dump-files' })
    }

    return (
        <div className="flex flex-col mt-5 pl-2 w-full mx-auto">
            <div className="flex flex-col mt-3 gap-3">
                <div className="flex">
                    <span className="underline underline-offset-8">Database</span>
                </div>
                <div className="flex">
                    <input type="file" id="csv" multiple onChange={handleFileChange} />
                </div>
                <div className="flex">
                    <Button
                        parentComponent="dev-recreate"
                        text="Recreate"
                        icon="none"
                        isLoading={false}
                        buttonCommand={handleDBRecreate}
                    />
                </div>
                <div className="flex">
                    <span className="underline underline-offset-8">Directory</span>
                </div>
                <div className="flex">
                    <Button
                        parentComponent="dev-open"
                        text="Open"
                        icon="none"
                        isLoading={false}
                        buttonCommand={handleOpenUserPath}
                    />
                </div>
                <div className="flex">
                    <Button
                        parentComponent="dev-dump"
                        text="Dump"
                        icon="none"
                        isLoading={false}
                        buttonCommand={handleDumpFiles}
                    />
                </div>
                <div className="flex">
                    <span className="underline underline-offset-8">Components</span>
                </div>
                <div className="flex">
                    <Spinner
                        size="sm"
                        color="white"
                    />
                    <Spinner
                        size="md"
                        color="white"
                    />
                    <Spinner
                        size="lg"
                        color="white"
                    />
                    <Spinner
                        size="sm"
                        color="gray"
                    />
                    <Spinner
                        size="md"
                        color="gray"
                    />
                    <Spinner
                        size="lg"
                        color="gray"
                    />
                </div>
                <div className="flex">
                    <Button
                        parentComponent="dev"
                        text="Button"
                        isLoading={false}
                        icon="none"
                    />
                    <Button
                        parentComponent="dev-2"
                        text="Button 2"
                        isLoading={true}
                        icon="none"
                    />
                    <Button
                        parentComponent="dev-3"
                        text="Button 3"
                        isLoading={false}
                        icon="search"
                    />
                </div>
            </div>
        </div>
    )
}