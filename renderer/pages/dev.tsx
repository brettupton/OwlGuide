import React, { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/Button'
import Link from 'next/link'
import ProgressBar from '../components/ProgressBar'

export default function Development() {
    const router = useRouter()
    const [barProgress, setBarProgress] = useState<number>(0)

    useEffect(() => {
        window.ipc.on('update-success', () => {
            router.refresh()
        })

        window.ipc.send('dev', { method: "progress-bar" })
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
                <div className="flex w-1/2">
                    <ProgressBar
                        title="OwlGuide"
                    />
                </div>
                <div className="flex">
                    <span className="underline underline-offset-8">Routes</span>
                </div>
                <div className="flex">
                    <Link href="old-enrollment">Enrollment</Link>
                </div>
            </div>
        </div>
    )
}