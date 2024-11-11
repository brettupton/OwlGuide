import { useEffect, useState } from "react"
import { BackArrow, PageTable, TermSelect } from "../components"

export default function Course() {
    const [courses, setCourses] = useState([])
    const [totalRows, setTotalRows] = useState<number>(0)
    const [term, setTerm] = useState<string>("")
    const [limit, setLimit] = useState<number>(30)
    const [offset, setOffset] = useState<number>(0)

    useEffect(() => {
        if (typeof window !== undefined && window.ipc) {
            window.ipc.on('course-data', ({ courses, total, term }: { courses: DBRow[], total: number, term: string }) => {
                setCourses(courses)
                setTerm(term)
                setTotalRows(total)
            })
        }
    }, [])

    const updatePage = (newPage: number) => {
        const newOffset = newPage - 1

        if (newOffset >= 0) {
            window.ipc.send('course', { method: 'get-term-course', data: { term, limit, offset: newOffset } })
            setOffset(newOffset)
        }
    }

    return (
        <div className="flex flex-col w-full">
            <BackArrow path="home" />
            <div className="flex">
                {courses.length > 0
                    ?
                    <div className="flex flex-col w-full px-2">
                        <div className="flex text-sm">
                            Term: {term}
                        </div>
                        <PageTable pageData={courses} totalRows={totalRows} page={offset + 1} updatePage={updatePage} />
                    </div>
                    :
                    <TermSelect process="course" />
                }
            </div>
        </div>
    )
}