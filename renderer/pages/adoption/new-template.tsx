import { useEffect, useState, useRef, ChangeEvent } from "react"

export default function NewTemplate() {
    const [templateCourses, setTemplateCourses] = useState<any[]>([])
    const [courseAlphaSorted, setCourseAlphaSorted] = useState<boolean>(false)
    const [titleAlphaSorted, setTitleAlphaSorted] = useState<boolean>(false)
    const [term, setTerm] = useState<string>("")
    const [campus, setCampus] = useState<string>("")

    const TemplateTableRef = useRef(null)
    const PrevCoursesLengthRef = useRef(0)

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('new-course', ({ Course, Title, term, campus }: { Course: string, Title: string, term: string, campus: string }) => {
                const newCourse = {
                    Course: Course,
                    Title: Title,
                    ISBN: "",
                    noText: false
                }
                setTemplateCourses((prevCourses) => {
                    // if (prevCourses.some(course => course.Course === Course)) {
                    //     return prevCourses
                    // }

                    return [...prevCourses, newCourse]
                })
                setTerm(term)
                setCampus(campus)
            })
        }
    }, [])

    useEffect(() => {
        // Scroll to bottom of table if new course is added
        if (templateCourses.length > PrevCoursesLengthRef.current) {
            TemplateTableRef.current.scrollIntoView(0)
        }

        PrevCoursesLengthRef.current = templateCourses.length
    }, [templateCourses])

    const handleAdoptionRemove = (course) => {
        setTemplateCourses((prevCourses) => prevCourses.filter(currCourse => currCourse.ID !== course.ID))
    }

    const handleISBNChange = (event: ChangeEvent<HTMLInputElement>, course) => {
        const { value } = event.currentTarget

        setTemplateCourses((prevCourses) => {
            return prevCourses.map((c) => {
                if (c.ID === course.ID) {
                    return { ...c, ISBN: value }
                }
                return c
            })
        })
    }

    const handleNoTextChange = (course) => {
        setTemplateCourses((prevCourses) => {
            return prevCourses.map((c) => {
                if (c.ID === course.ID) {
                    return { ...c, noText: !(c.noText) }
                }
                return c
            })
        })
    }

    const handleCourseSort = (sortByType: string) => {
        const sorted = [...templateCourses]
        // Sort either alphabetically or reverse alpha
        switch (sortByType) {
            case "Course":
                if (!courseAlphaSorted) {
                    sorted.sort((course1, course2) => (course1.Course).localeCompare(course2.Course))
                    setCourseAlphaSorted(true)
                } else {
                    sorted.sort((course1, course2) => (course2.Course).localeCompare(course1.Course))
                    setCourseAlphaSorted(false)
                }
                break
            case "Title":
                if (!titleAlphaSorted) {
                    sorted.sort((course1, course2) => (course1.Title).localeCompare(course2.Title))
                    setTitleAlphaSorted(true)
                } else {
                    sorted.sort((course1, course2) => (course2.Title).localeCompare(course1.Title))
                    setTitleAlphaSorted(false)
                }
            default:
                break
        }
        setTemplateCourses([...sorted])
    }

    const handleTemplateSubmit = () => {
        window.ipc.send('template-submit', { templateCourses, term, campus })
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-1rem)]">
            <table className="w-full sm:text-sm lg:text-md text-left rtl:text-right" ref={TemplateTableRef}>
                <thead className="text-gray-200 uppercase border-b bg-gray-600 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-2">
                            <div className="flex items-center">
                                Course
                                <a href="#" onClick={() => handleCourseSort("Course")}><svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                </svg></a>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-2">
                            <div className="flex items-center">
                                Title
                                <a href="#" onClick={() => handleCourseSort("Title")}><svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                </svg></a>
                            </div>
                        </th>
                        <th scope="col" className="px-2 py-2">
                            ISBN
                        </th>
                        <th scope="col" className="px-2 py-2">
                            No Text?
                        </th>
                        <th scope="col" className="px-2 py-2">
                            ID
                        </th>
                        <th scope="col" className="px-2 py-2">
                            <div>
                                <button type="button" onClick={handleTemplateSubmit}
                                    className="flex justify-center items-center select-none rounded-full shadow focus:outline-none focus:shadow-outlines">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </button>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {templateCourses.map((course, key: number) => {
                        return (
                            <tr className="border-b border-white text-gray-200 font-semibold" key={key}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    {course.Course}
                                </td>
                                <td className="px-6 py-4 truncate">
                                    {course.Title}
                                </td>
                                <td className="px-2 py-4">
                                    <input type="text" value={course.ISBN} onChange={(event) => handleISBNChange(event, course)} disabled={course.noText}
                                        className={`block text-md text-white border border-gray-600 rounded-lg bg-gray-700 focus:outline-none placeholder-gray-400 p-1 ${course.noText && 'cursor-not-allowed'}`} maxLength={13} />
                                </td>
                                <td className="px-2 py-4 text-center">
                                    <input type="checkbox" value="" checked={course.noText} onChange={() => handleNoTextChange(course)} disabled={course.ISBN.length > 0}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                </td>
                                <td className="px-6 py-4">
                                    {course.ID}
                                </td>
                                <td className="px-2 py-4">
                                    <button type="button" onClick={() => handleAdoptionRemove(course)}
                                        className="flex justify-center items-center select-none rounded-full shadow focus:outline-none focus:shadow-outline">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}