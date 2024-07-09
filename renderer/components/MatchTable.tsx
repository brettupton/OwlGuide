import { ChangeEvent } from "react"
import { XLSXCourse } from "../../types/Enrollment"

interface MatchTableProps {
    needOfferings: XLSXCourse[]
    handleOfferingChange: (event: ChangeEvent<HTMLInputElement>, course: XLSXCourse) => void
    handleNoOffSubmit: () => void
}

export default function MatchTable({ needOfferings, handleOfferingChange, handleNoOffSubmit }: MatchTableProps) {
    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-4.5rem)]">
                <table className="w-full sm:text-sm lg:text-md text-left rtl:text-right">
                    <thead className="text-gray-200 uppercase border-b bg-gray-600 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                CRN
                            </th>
                            <th scope="col" className="py-3">
                                Course
                            </th>
                            <th scope="col" className="py-3">
                                Section
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Professor
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Title
                            </th>
                            <th scope="col">
                                <div>
                                    <button type="button" onClick={handleNoOffSubmit}
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
                        {needOfferings.map((course: XLSXCourse, key: number) => {
                            return (
                                <tr className="border-b border-white text-black font-semibold odd:bg-gray-200 even:bg-gray-300" key={key}>
                                    <td className="px-4 py-2">
                                        {course["COURSE REFERENCE NUMBER"]}
                                    </td>
                                    <td className="py-2">
                                        {`${course["SUBJECT"]} ${course["COURSE NUMBER"]}`}
                                    </td>
                                    <td className="py-2">
                                        <input type="text" onChange={(event) => handleOfferingChange(event, course)} maxLength={3} minLength={3}
                                            className="block text-md text-white border border-gray-600 rounded-lg bg-gray-700 focus:outline-none placeholder-gray-400 p-1 w-12" />
                                    </td>
                                    <td className="px-4 py-2 uppercase">
                                        {course["PRIMARY INSTRUCTOR LAST NAME"] || "TBD"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {course.TITLE}
                                    </td>
                                    <td>

                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end px-2 py-1 sm:text-sm lg:text-lg">{needOfferings.length} / {needOfferings.length}</div>
        </div>
    )
}