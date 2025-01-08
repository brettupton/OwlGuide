import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react"
import { BackArrow, PageTable, TermSelect } from "../components"

export default function Course() {
    const [courses, setCourses] = useState<DBRow[]>([])
    const [totalRows, setTotalRows] = useState<number>(0)
    const [term, setTerm] = useState<string>("")
    const [limit, setLimit] = useState<number>(30)
    const [page, setPage] = useState<number>(1)
    const [activeCourse, setActiveCourse] = useState<number>(0)
    const [searchCourse, setSearchCourse] = useState<{ Dept: string, Course: string, Section: string }>({
        Dept: "",
        Course: "",
        Section: ""
    })

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)

    useEffect(() => {
        if (typeof window !== undefined && window.ipc) {
            window.ipc.on('course-data', ({ courses, total, term }: { courses: DBRow[], total: number, term: string }) => {
                if (courses.length > 0) {
                    setCourses(courses)
                }
                setTerm(term)
                setTotalRows(total)
                tableRef.current.scrollIntoView({ behavior: "auto" })
            })
        }
    }, [])

    const updatePage = (forward: boolean) => {
        // Pivot on either last in array or first in array based on page direction (forward -> true, backward -> false)
        const pivot = forward ? courses.at(-1) : courses[0]
        window.ipc.send('main',
            {
                process: 'course',
                method: 'get-term-course',
                data: { term, limit, isForward: forward, isSearch: false, pivotCourse: { Dept: pivot.Dept, Course: pivot.Course, Section: pivot.Section } }
            })
        // Calculate new page number within constraints
        let newPage = page + (forward ? 1 : -1)
        if (newPage >= 1 && newPage < Math.floor(totalRows / limit)) {
            setPage(newPage)
        }
    }

    const handleRowClick = (courseID: number) => {
        setActiveCourse(courseID)
        window.ipc.send('child', { process: 'course', data: { courseID } })
    }

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.currentTarget

        setSearchCourse({
            ...searchCourse,
            [id]: value
        })
    }

    const handleSearch = () => {
        window.ipc.send('main',
            {
                process: 'course',
                method: 'get-term-course',
                data: { term, limit, isForward: true, isSearch: true, pivotCourse: { Dept: searchCourse.Dept, Course: searchCourse.Course, Section: searchCourse.Section } }
            })
    }

    const handleReset = () => {
        setTerm("")
        setCourses([])
        setPage(1)
        setActiveCourse(0)
    }

    return (
        <div className="flex flex-col w-full">
            <BackArrow path="home" />
            <div className="flex">
                {courses.length > 0
                    ?
                    <div className="flex flex-col w-full px-2">
                        <div className="flex text-sm mb-1 p-2 gap-1">
                            <div className="flex w-1/12">
                                <input
                                    type="text"
                                    id="Dept"
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                                    placeholder="Dept"
                                    defaultValue={searchCourse["Dept"]}
                                    minLength={4}
                                    maxLength={4}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="flex w-1/12">
                                <input
                                    type="text"
                                    id="Course"
                                    defaultValue={searchCourse["Course"]}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                                    placeholder="Course"
                                    minLength={3}
                                    maxLength={3}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="flex w-1/12">
                                <input
                                    type="text"
                                    id="Section"
                                    defaultValue={searchCourse["Section"]}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                                    placeholder="Section"
                                    minLength={3}
                                    maxLength={3}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="flex w-1/12">
                                <button
                                    className="bg-white hover:bg-gray-300 text-gray-800 font-semibold w-full py-1 px-1 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>
                            </div>
                            <div className="flex w-2/3 justify-end gap-2">
                                <div className="flex text-md font-bold border border-white rounded px-2 py-1">{term}</div>
                                <div className="flex">
                                    <button
                                        className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-1 px-1 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
                                        onClick={handleReset}>Change</button>
                                </div>
                            </div>
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