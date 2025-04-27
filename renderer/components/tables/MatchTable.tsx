import { ChangeEvent } from "react"
import { IntermCourse } from "../../../types/Enrollment"

interface MatchTableProps {
    numCourses: number
    noSections: IntermCourse[]
    handleSectionChange: (e: ChangeEvent<HTMLInputElement>, course: IntermCourse) => void
    handleSubmit: () => void
}

export default function MatchTable({ numCourses, noSections, handleSectionChange, handleSubmit }: MatchTableProps) {
    const filteredKeys = ["Unit", "EstEnrl", "ActEnrl"]
    const centeredKeys = ["Dept", "Course", "Section"]
    return (
<<<<<<< HEAD
<<<<<<< HEAD
        <div className="flex flex-col w-full p-2">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-9.5rem)]">
                <table className="w-full text-sm text-left rtl:text-right text-white">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="p-2">
                                CRN
                            </th>
                            <th scope="col" className="p-2">
                                Course
                            </th>
                            <th scope="col" className="p-2">
                                Section
                            </th>
                            <th scope="col" className="p-2">
                                Professor
                            </th>
                            <th scope="col" className="p-2">
                                Title
                            </th>
                            <th scope="col">
                                <div className="group flex relative">
                                    <button type="button" onClick={handleSubmit}
                                        className="flex justify-center items-center select-none rounded-full shadow focus:outline-none focus:shadow-outlines">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
=======
=======
>>>>>>> main
        <div className="w-full p-2">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-8.91rem)]">
                {noSections.length > 0 &&
                    <table className="w-full text-sm text-left rtl:text-right text-white table-auto">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                {Object.keys(noSections[0]).map((header) => {
                                    return (
                                        !filteredKeys.includes(header) &&
                                        <th className={`px-2 py-1 ${centeredKeys.includes(header) ? 'text-center' : ''}`} key={header}>{header}</th>
                                    )
                                })}
                                <th className="px-2 py-1">
                                    <button title="Download CSV" className="hover:text-white" onClick={handleSubmit}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                                        </svg>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {noSections.map((course) => {
                                return (
                                    <tr className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600" key={`${course["CRN"]}`} >
                                        {Object.keys(course).map((key, index) => {
                                            return (
                                                !filteredKeys.includes(key) &&
                                                <td
                                                    className={`p-2 ${centeredKeys.includes(key) ? 'text-center' : ''}`}
                                                    key={`${course["CRN"]}-${index}`}
                                                    id={`${course["CRN"]}`}
                                                >
                                                    {key === "Section" ?
                                                        <input type="text" maxLength={3} className="rounded bg-gray-500 px-4 w-16"
                                                            onChange={(e) => handleSectionChange(e, course)} />
                                                        : course[key]}
                                                </td>
                                            )
                                        })}
                                        <td className="p-2"></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </div>
            <div className="text-xs text-end mt-1">
                {noSections.length} / {numCourses}
            </div>
        </div>
    )
}