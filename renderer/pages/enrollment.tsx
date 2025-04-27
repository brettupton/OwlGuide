<<<<<<< HEAD
import { useState, useEffect, ChangeEvent } from "react"
import { BackArrow, FileForm, MatchTable } from "../components"
import { IntermCourse } from "../../types/Enrollment"

export default function EnrollmentHome() {
<<<<<<< HEAD
    const [enrollment, setEnrollment] = useState<string[][]>([])
    const [needOfferings, setNeedOfferings] = useState<string[][]>([])

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('data', (data: { enrollment: string[][] }) => {
                // Sort by department and course number, then find courses with no offering numbers
                const sorted = data.enrollment.sort((a, b) => {
                    if (a[1].localeCompare(b[1]) !== 0) {
                        return a[1].localeCompare(b[1])
                    }
=======
    const [enrollment, setEnrollment] = useState<IntermCourse[]>([])
    const [noSections, setNoSections] = useState<IntermCourse[]>([])

    useEffect(() => {
        window.ipc.on('data', ({ enrollment }: { enrollment: IntermCourse[] }) => {
            // Find courses with no offering numbers then sort by department and course number
            const noFileSections = enrollment.filter((course) => course.Section === "0")
>>>>>>> main

            noFileSections.sort((a, b) => {
                if (a["Dept"].localeCompare(b["Dept"]) !== 0) {
                    return a["Dept"].localeCompare(b["Dept"])
                }

<<<<<<< HEAD
                setEnrollment(sorted)
                setNeedOfferings(offerings)
            })

            window.ipc.on('success', () => {
                setEnrollment([])
                setNeedOfferings([])
            })
        }
=======
                return a["Course"].localeCompare(b["Course"])
            })

            setEnrollment(enrollment)
            setNoSections(noFileSections)
        })

        window.ipc.on('download-success', () => {
            setEnrollment([])
            setNoSections([])
        })
>>>>>>> main
    }, [])

    const handleSectionChange = (e: ChangeEvent<HTMLInputElement>, course: IntermCourse) => {
        const { value } = e.currentTarget
        const matchIndex = enrollment.findIndex((enrollCourse) => enrollCourse.CRN === course.CRN)

        setEnrollment((prevCourses) => {
            prevCourses[matchIndex]["Section"] = value

            return [...prevCourses]
        })
    }

    const handleSubmit = () => {
<<<<<<< HEAD
        window.ipc.send('main', { process: 'enrollment', method: 'file-download', data: { enrollment } })
=======
        window.ipc.send('main', { process: 'enrollment', method: 'file-download', data: { type: "enrollment", enrollment } })
>>>>>>> main
    }

    return (
        <div className="flex flex-col h-full w-full">
            <BackArrow path="home" />
            {enrollment.length <= 0 ?
                <FileForm process="enrollment" label="Enrollment File" accept=".xlsx" />
                :
                <MatchTable numCourses={enrollment.length} noSections={noSections} handleSectionChange={handleSectionChange} handleSubmit={handleSubmit} />
            }
=======
import { ChangeEvent, useEffect, useState } from "react"
import { BackArrow, FileForm, Spinner } from "../components"
import { BannerTerm } from "../../types/Enrollment"
import ProgressBar from "../components/ProgressBar"
import { useRouter } from "next/navigation"

export default function EnrollmentPage() {
    const [terms, setTerms] = useState<string[]>([])
    const [termOptions, setTermOptions] = useState<BannerTerm[]>()
    const [selectedTerm, setSelectedTerm] = useState<string>("")

    const router = useRouter()

    useEffect(() => {
        window.ipc.send('main', { process: 'enrollment', method: 'get-api-terms', data: { type: 'enrollment' } })

        window.ipc.on('terms-data', ({ terms }: { terms: BannerTerm[] }) => {
            setTermOptions(terms.map((term) => term))
            setTerms(terms.map((term) => term.description))
        })

        window.ipc.on('file-canceled', () => {
            router.refresh()
        })

        window.ipc.on('download-success', () => {
            router.refresh()
        })
    }, [])

    const handleTermChoice = (e: ChangeEvent<HTMLSelectElement>) => {
        const termChoice = e.currentTarget.value

        if (termChoice) {
            setSelectedTerm(termChoice)
            const termOpt = termOptions.find((option) => option.description === termChoice)
            window.ipc.send('main', { process: 'enrollment', method: 'get-api-sections', data: { type: 'enrollment', term: termOpt } })
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex justify-center">
                {terms.length > 0 && selectedTerm.length > 0
                    ?
                    <div className="flex w-1/2">
                        <ProgressBar title={`${selectedTerm} Enrollment`} />
                    </div>
                    :
                    <div className="flex flex-col gap-5">
                        <div className="flex">
                            {/* <FileForm process="enrollment" label="Enrollment File" /> */}
                        </div>
                        <div className="flex justify-center">
                            {
                                terms.length > 0
                                    ?
                                    <select
                                        className={`border text-sm rounded-lg block px-1 py-2 bg-gray-700 border-gray-600 text-white ${selectedTerm ? "ring-2 ring-white" : ""}`}
                                        onChange={handleTermChoice}
                                    >
                                        <option value="">Term</option>
                                        {terms.map((term, index) => {
                                            return (
                                                <option value={term} key={index}>{term}</option>
                                            )
                                        })}
                                    </select>
                                    :
                                    <Spinner size="md" color="white" />
                            }
                        </div>
                    </div>
                }
            </div>
>>>>>>> main
        </div>
    )
}