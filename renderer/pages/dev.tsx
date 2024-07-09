import React, { ChangeEvent, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Development() {
    const [store, setStore] = useState<number>(0)
    const [progress, setProgress] = useState<number>(0)
    const [term, setTerm] = useState<string>("")
    const [filePath, setFilePath] = useState<string>("")

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('progress-update', (progress: number) => {
                setProgress(progress)
            })
        }
    }, [])

    const handleStoreChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { valueAsNumber } = e.currentTarget
        setStore(valueAsNumber)
    }

    const handleTermChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget
        setTerm(value)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { files } = e.currentTarget

        if (files) {
            setFilePath(files[0].path)
        }
    }

    const handleSubmit = () => {
        if (store > 0 && term !== "" && filePath !== "") {
            window.ipc.send('new-sales', { store: store, term: term, filePath: filePath })
        }
    }


    return (
        <React.Fragment>
            <Head>
                <title>OwlGuide - Dev</title>
            </Head>
            <div className="grid grid-col-1 text-xl w-10 text-start pl-2 mt-2">
                <Link href="/home">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg>
                </Link>
            </div>
            {progress <= 0 &&
                <>
                    <div className="flex justify-start gap-2 ml-3 mt-3">
                        <div className="w-20">
                            <input type="number" id="store" onChange={handleStoreChange}
                                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                maxLength={4} min={1} max={9999} />
                            <label htmlFor="store" className="block mb-2 text-sm font-medium text-gray-900 text-white">Store</label>
                        </div>
                        <div className="w-20">
                            <input type="text" id="term" onChange={handleTermChange}
                                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                maxLength={1} />
                            <label htmlFor="term" className="block mb-2 text-sm font-medium text-gray-900 text-white">Term</label>
                        </div>
                    </div>
                    <div className="mt-3 ml-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-auto">
                                <input type="file" id="file" onChange={handleFileChange}
                                    className="block text-md text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>
                            <div className="w-auto">
                                <button onClick={handleSubmit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 active:scale-95 transition-transform duration-75">
                                    Submit
                                </button>
                            </div>
                        </div>
                        <label htmlFor="file" className="block mt-1 text-sm font-medium text-gray-900 text-white">
                            Sequence: Term, Dept/Course, Section, Professor, ISBN, Est Enrl, Act Enrl,
                            Est Sales, Reorders, Act Sales
                        </label>
                    </div>
                </>
            }
            <div className="flex mt-10 px-5">
                <div className="flex w-full h-4 bg-neutral-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="flex flex-col justify-center rounded-full overflow-hidden bg-gray-400 text-xs text-white text-center whitespace-nowrap transition duration-700" style={{ width: progress * 8 }}>{progress}%</div>
                </div>
            </div>
        </React.Fragment>
    )
}