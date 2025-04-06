import { useState, useEffect, ChangeEvent } from "react"
import { BackArrow, FileForm, MatchTable } from "../components"
import { IntermCourse } from "../../types/Enrollment"

export default function EnrollmentHome() {
    const [enrollment, setEnrollment] = useState<IntermCourse[]>([])
    const [noSections, setNoSections] = useState<IntermCourse[]>([])

    useEffect(() => {
        window.ipc.on('data', ({ enrollment }: { enrollment: IntermCourse[] }) => {
            // Find courses with no offering numbers then sort by department and course number
            const noFileSections = enrollment.filter((course) => course.Section === "0")

            noFileSections.sort((a, b) => {
                if (a["Dept"].localeCompare(b["Dept"]) !== 0) {
                    return a["Dept"].localeCompare(b["Dept"])
                }

                return a["Course"].localeCompare(b["Course"])
            })

            setEnrollment(enrollment)
            setNoSections(noFileSections)
        })

        window.ipc.on('download-success', () => {
            setEnrollment([])
            setNoSections([])
        })
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
        window.ipc.send('main', { process: 'enrollment', method: 'file-download', data: { type: "enrollment", enrollment } })
    }

    return (
        <div className="flex flex-col h-full w-full">
            <BackArrow path="home" />
            {enrollment.length <= 0 ?
                <FileForm process="enrollment" label="Enrollment File" accept=".xlsx" />
                :
                <MatchTable numCourses={enrollment.length} noSections={noSections} handleSectionChange={handleSectionChange} handleSubmit={handleSubmit} />
            }
        </div>
    )
}