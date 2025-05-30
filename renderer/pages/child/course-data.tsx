import { useState, useEffect } from "react"
import { Spinner } from "../../components"
import { CourseData } from "../../../types/Course"

export default function CourseDataPage() {
    const [courseAdoptions, setCourseAdoptions] = useState<DBRow[]>()
    const [courseInfo, setCourseInfo] = useState<CourseData>()

    useEffect(() => {
        window.ipc.send('ready-to-receive')

        window.ipc.on('data', ({ books, course }: { books: DBRow[], course: CourseData }) => {
            setCourseAdoptions(books)
            setCourseInfo(course)
        })
    }, [])

    return (
        <div className="flex flex-col m-3">
            {courseInfo ?
                <div className="flex flex-col">
                    <div className="flex font-semibold">
                        {courseInfo["Title"].length > 0 ? courseInfo["Title"] : "NO COURSE TITLE"}
                    </div>
                    <div className="flex text-sm -mt-1">
                        {courseInfo["Dept"]} {courseInfo["Course"]} {courseInfo["Section"]}
                    </div>
                    <div className="flex rounded bg-gray-300 mt-2 min-h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)]">
                        <div className="relative overflow-x-auto max-h-[calc(100vh-1rem)] m-2 w-full">
                            {courseAdoptions.length > 0 ?
                                <table className="w-full text-sm text-left rtl:text-right text-white">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                        <tr>
                                            {Object.keys(courseAdoptions[0]).map((header, index) => {
                                                return (
                                                    <th scope="col" className="px-2 py-1" key={index}>
                                                        {header}
                                                    </th>
                                                )
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseAdoptions.map((book) => {
                                            return (
                                                <tr className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600" key={book["ISBN"]}>
                                                    {Object.keys(book).map((bookHeader, index) => {
                                                        return (
                                                            <td key={`${index}-${bookHeader}`} className="px-2 py-1">
                                                                {book[bookHeader]}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                :
                                <div className="flex text-black font-semibold">{courseInfo["NoText"] === "Y" ? "No Text Required" : "No Adoptions for Course"}</div>
                            }
                        </div>
                    </div>
                </div>
                :
                <Spinner
                    size="md"
                    color="white"
                />
            }
        </div>
    )
}