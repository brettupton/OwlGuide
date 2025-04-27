import { useEffect, useState } from "react"

interface IProgressBar {
    title: string
}

export default function ProgressBar({ title }: IProgressBar) {
    const [progress, setProgress] = useState<number>(0)

    useEffect(() => {
        window.ipc.on('progress-update', ({ updatedProgress }: { updatedProgress: number }) => {
            setProgress(updatedProgress)
        })
    }, [])

    return (
        <div className="flex flex-col w-full m-2">
            <div className="flex justify-between mb-1 text-sm font-medium text-white">
                <div className="flex">{title}</div>
                <div className="flex">{progress}%</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-gray-300 h-2.5 rounded-full" style={{ "width": `${progress}%` }}></div>
            </div>
        </div>
    )
}