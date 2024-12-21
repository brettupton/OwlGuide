import { useState, useEffect, ChangeEvent } from "react"
import { BackArrow, FileForm, MatchTable } from "../components"

/* 
Array indices for enrollment
Campus  0
Dept    1
Course  2
Section 3
Prof    4
EstEnrl 5
ActEnrl 6
Title   7
CRN     8
*/

export default function EnrollmentHome() {
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

                    return a[2].localeCompare(b[2])
                })
                const offerings = sorted.filter((course) => course[3] === "0")

                setEnrollment(sorted)
                setNeedOfferings(offerings)
            })

            window.ipc.on('success', () => {
                setEnrollment([])
                setNeedOfferings([])
            })
        }
    }, [])

    const handleOfferingChange = (e: ChangeEvent<HTMLInputElement>, course: string[]) => {
        const { value } = e.currentTarget
        const CRN = course[8]
        const matchIndex = enrollment.findIndex((enrollCourse) => enrollCourse[8] === CRN)

        setEnrollment((prevCourses) => {
            prevCourses[matchIndex][3] = value
            return [...prevCourses]
        })
    }

    const handleSubmit = () => {
        window.ipc.send('main', { process: 'enrollment', method: 'file-download', data: { enrollment } })
    }

    return (
        <div className="flex flex-col h-full w-full">
            <BackArrow path="home" />
            {needOfferings.length <= 0 ?
                <FileForm process="enrollment" label="Enrollment File" accept=".xlsx" />
                :
                <MatchTable dataLength={enrollment.length} needOfferings={needOfferings} handleOfferingChange={handleOfferingChange} handleSubmit={handleSubmit} />
            }
        </div>
    )
}