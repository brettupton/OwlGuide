import { MutableRefObject, useEffect, useRef, useState } from "react"
import { BackArrow, PageTable, TermSelect } from "../components"

export default function Course() {
    const [courses, setCourses] = useState<DBRow[]>([])
    const [totalRows, setTotalRows] = useState<number>(0)
    const [term, setTerm] = useState<string>("")
    const [limit, setLimit] = useState<number>(30)
    const [page, setPage] = useState<number>(1)
    const [activeCourse, setActiveCourse] = useState<number>(0)

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)

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
        if (newPage >= 0) {
            const latestCourse = courses.at(-1)
            window.ipc.send('main',
                {
                    process: 'course',
                    method: 'get-term-course',
                    data: { term, limit, lastCourse: { ID: latestCourse.ID, Dept: latestCourse.Dept, Course: latestCourse.Course, Section: latestCourse.Section } }
                })
            setPage(newPage)
            tableRef.current.scrollIntoView({ behavior: "auto" })
        }
    }

    const handleRowClick = (courseID: number) => {
        setActiveCourse(courseID)
        window.ipc.send('child', { process: 'course', data: { courseID } })
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
                        <PageTable
                            pageData={courses}
                            totalRows={totalRows}
                            page={page}
                            limit={limit}
                            updatePage={updatePage}
                            tableRef={tableRef}
                            handleRowClick={handleRowClick}
                            activeRow={activeCourse}
                        />
                    </div>
                    :
                    <TermSelect process="course" />
                }
            </div>
        </div>
    )
}