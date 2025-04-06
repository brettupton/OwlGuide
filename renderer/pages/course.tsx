import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react"
import { BackArrow, PageTable, TermSelect } from "../components"
import { CourseData } from "../../types/Course"

export default function Course() {
    const [courses, setCourses] = useState<CourseData[]>([])
    const [totalRows, setTotalRows] = useState<number>(0)
    const [selectedTerm, setSelectedTerm] = useState<string>("")
    const [limit, setLimit] = useState<number>(30)
    const [pageNum, setPageNum] = useState<number>(1)
    const [activeCourse, setActiveCourse] = useState<number>(0)
    const [searchCourse, setSearchCourse] = useState<{ Dept: string, Course: string, Section: string }>({
        Dept: "",
        Course: "",
        Section: ""
    })

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)

    useEffect(() => {
        window.ipc.on('course-data', ({ courses, total, term }: { courses: CourseData[], total: number, term: string }) => {
            if (courses.length > 0) {
                setCourses(courses)
            }
            setSelectedTerm(term)
            setTotalRows(total)
            if (tableRef.current) {
                tableRef.current.scrollIntoView({ behavior: "auto" })
            }

            window.ipc.send('close-child', { prompt: false })
        })
    }, [])

    const updatePage = (forward: boolean) => {
        // Pivot on either last in array or first in array based on page direction (forward -> true, backward -> false)
        const pivot = forward ? courses.at(-1) : courses[0]
        window.ipc.send('main',
            {
                process: 'course',
                method: 'get-term-course',
                data: { type: 'course', term: selectedTerm, limit, isForward: forward, isSearch: false, pivotCourse: { Dept: pivot.Dept, Course: pivot.Course, Section: pivot.Section } }
            })
        // Calculate new page number within constraints
        let newPage = pageNum + (forward ? 1 : -1)
        if (newPage >= 1 && newPage < Math.floor(totalRows / limit)) {
            setPageNum(newPage)
        }
    }

    const handleRowClick = (row: DBRow) => {
        setActiveCourse(row["ID"] as number)
        window.ipc.send('child', { process: 'course', data: { course: row } })
    }

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.currentTarget

        setSearchCourse({
            ...searchCourse,
            [id]: value
        })
    }

    const handleSearch = () => {
        if (Object.values(searchCourse).some((searchVal) => searchVal !== "")) {
            window.ipc.send('main',
                {
                    process: 'course',
                    method: 'get-term-course',
                    data: { type: 'course', term: selectedTerm, limit, isForward: true, isSearch: true, pivotCourse: { Dept: searchCourse.Dept, Course: searchCourse.Course, Section: searchCourse.Section } }
                })
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex flex-col m-4">
                <div className="flex w-full gap-2">
                    <div className="flex">
                        <TermSelect process="course" />
                    </div>
                    <div className="flex gap-2 w-1/3">
                        <div className="flex">
                            <input type="text"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full px-2 py-1"
                                id="Dept"
                                placeholder="Dept"
                                value={searchCourse["Dept"]}
                                maxLength={4}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="flex">
                            <input type="text"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full px-2 py-1"
                                id="Course"
                                placeholder="Course"
                                value={searchCourse["Course"]}
                                maxLength={3}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="flex">
                            <input type="text"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full px-2 py-1"
                                id="Section"
                                placeholder="Section"
                                value={searchCourse["Section"]}
                                maxLength={3}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="flex">
                            <button className="bg-white hover:bg-gray-300 text-gray-800 font-semibold px-1 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
                                onClick={handleSearch}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {selectedTerm &&
                    <div className="flex mt-3">
                        <PageTable
                            pageData={courses}
                            totalRows={totalRows}
                            pageNum={pageNum}
                            limit={limit}
                            updatePage={updatePage}
                            tableRef={tableRef}
                            handleRowClick={handleRowClick}
                            activeRow={activeCourse}
                        />
                    </div>
                }
            </div>
        </div>
    )
}