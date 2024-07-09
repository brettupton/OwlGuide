import React, { ChangeEvent, useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { XLSXCourse } from "../../types/Enrollment"
import MatchTable from "../components/MatchTable"
import { useRouter } from "next/navigation"

export default function EnrollmentHome() {
    const [filePath, setFilePath] = useState<string>("")
    const [prevFilePath, setPrevFilePath] = useState<string>("")
    const [prevFileName, setPrevFileName] = useState<string>("")
    const [prevFileDate, setPrevFileDate] = useState<string>("")
    const [prevChecked, setPrevChecked] = useState<boolean>(false)
    const [needOfferings, setNeedOfferings] = useState<XLSXCourse[]>([])

    const router = useRouter()

    useEffect(() => {
        if (typeof window !== undefined && window.ipc) {
            window.ipc.on('enrollment-file-found', (prevFileName: string) => {
                setPrevFileName(prevFileName)
                setPrevChecked(true)
            })

            window.ipc.on('need-offering', (noMatch: XLSXCourse[]) => {
                const sorted = noMatch.sort((course1, course2) => {
                    if (course1.SUBJECT !== course2.SUBJECT) {
                        return course1.SUBJECT.localeCompare(course2.SUBJECT)
                    } else {
                        return course1["COURSE NUMBER"] - course2["COURSE NUMBER"]
                    }
                })
                setNeedOfferings([...sorted])
            })

            window.ipc.on('download-success', () => {
                router.refresh()
            })
        }
    }, [])

    useEffect(() => {
        // Format date from file name in MMMMDDYYYY
        if (prevFileName.length > 0) {
            const fileDate = prevFileName.split("_")[2].slice(0, -1)

            const year = parseInt(fileDate.substring(0, 4), 10)
            const month = parseInt(fileDate.substring(4, 6), 10)
            const day = parseInt(fileDate.substring(6, 8), 10)

            const date = new Date(year, month - 1, day)

            const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date)

            setPrevFileDate(formattedDate)
        }
    }, [prevFileName])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, files } = e.currentTarget

        if (files) {
            if (id === "xlsx") {
                setFilePath(files[0].path)
                window.ipc.send('enrollment-file-loaded', files[0].path)
            } else {
                setPrevFilePath(files[0].path)
            }
        }
    }

    const handleSubmit = () => {
        if (filePath !== "") {
            window.ipc.send('enrollment-upload', { filePath, prevFilePath })
        }
    }

    const handleOfferingChange = (event: ChangeEvent<HTMLInputElement>, course: XLSXCourse) => {
        const { value } = event.currentTarget

        setNeedOfferings((prevCourses) => {
            return prevCourses.map((c) => {
                if (c["COURSE REFERENCE NUMBER"] === course["COURSE REFERENCE NUMBER"]) {
                    return { ...c, "OFFERING NUMBER": value }
                }
                return c
            })
        })
    }

    const handleNoOffSubmit = () => {
        window.ipc.send('offerings-submit', ({ filePath, needOfferings }))
    }

    return (
        <React.Fragment>
            <Head>
                <title>OwlGuide - Enrollment</title>
            </Head>
            <div className="grid grid-col-1 text-xl w-10 text-start pl-2 mt-2">
                <Link href="/home">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg>
                </Link>
            </div>
            {needOfferings.length <= 0 ? (
                <div className="mt-3 ml-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-auto">
                            <input
                                type="file"
                                id="xlsx"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="block text-md text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none placeholder-gray-400" />
                        </div>
                        <div className="w-auto">
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 active:scale-95 transition-transform duration-75">
                                Submit
                            </button>
                        </div>
                    </div>
                    <label htmlFor="file" className="block mt-1 text-sm font-medium text-white">
                        Enrollment File
                    </label>
                    {prevChecked && (
                        prevFileName.length > 0 ? (
                            <div className="mt-3">
                                Last <span className="font-semibold">{`${prevFileName.split("_")[1].split(/(\d+)/)[0]} ${prevFileName.split("_")[1].split(/(\d+)/)[1]}`}</span> Upload: {prevFileDate}
                            </div>
                        ) : (
                            <div className="mt-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-auto">
                                        <input
                                            type="file"
                                            id="csv"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="block text-md text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none placeholder-gray-400" />
                                    </div>
                                </div>
                                <label htmlFor="file" className="block mt-1 text-sm font-medium text-white">
                                    Previous File
                                </label>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <MatchTable needOfferings={needOfferings} handleOfferingChange={handleOfferingChange} handleNoOffSubmit={handleNoOffSubmit} />
            )}

        </React.Fragment>
    )
}