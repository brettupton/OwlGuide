import { useState, useEffect, ChangeEvent } from "react"
import { BackArrow, FileForm, MatchTable } from "../components"
import { XLSXCourse } from "../../types/Enrollment"

export default function EnrollmentHome() {
    const [enrollment, setEnrollment] = useState<XLSXCourse[]>([])
    const [needOfferings, setNeedOfferings] = useState<XLSXCourse[]>([])

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('enrollment-data', (enrollment: XLSXCourse[]) => {
                // Get only courses with no offerings, then sort by subject and course number
                const offerings = enrollment
                    .filter((course) => !course["OFFERING NUMBER"] || course["OFFERING NUMBER"] === "000")
                    .sort((a, b) => {
                        if (a["SUBJECT"].localeCompare(b["SUBJECT"]) !== 0) {
                            return a["SUBJECT"].localeCompare(b["SUBJECT"])
                        }

                        return a["COURSE NUMBER"] - b["COURSE NUMBER"]
                    })

                setEnrollment(enrollment)
                setNeedOfferings(offerings)
            })

            window.ipc.on('enrl-success', () => {
                setEnrollment([])
                setNeedOfferings([])
            })
        }
    }, [])

    const handleOfferingChange = (e: ChangeEvent<HTMLInputElement>, course: XLSXCourse) => {
        const { value } = e.currentTarget

        setEnrollment((prevCourses) => {
            return prevCourses.map((c) => {
                if (c["COURSE REFERENCE NUMBER"] === course["COURSE REFERENCE NUMBER"]) {
                    return { ...c, "OFFERING NUMBER": value }
                }
                return c
            })
        })
    }

    const handleSubmit = () => {
        window.ipc.send('enrollment', { method: 'file-download', data: enrollment })
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex">
                <BackArrow path="home" />
            </div>
            <div className="flex">
                {needOfferings.length <= 0 ?
                    <FileForm process="enrollment" label="Enrollment File" accept=".xlsx,.csv" multiple={true} />
                    :
                    <MatchTable dataLength={enrollment.length} needOfferings={needOfferings} handleOfferingChange={handleOfferingChange} handleSubmit={handleSubmit} />
                }
            </div>
        </div>
    )
}