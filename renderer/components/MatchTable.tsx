import { ChangeEvent } from "react"


interface MatchTableProps {
    dataLength: number
    needOfferings: string[][]
    handleOfferingChange: (e: ChangeEvent<HTMLInputElement>, course: string[]) => void
    handleSubmit: () => void
}

export default function MatchTable({ dataLength, needOfferings, handleOfferingChange, handleSubmit }: MatchTableProps) {
    return (
        <div className="flex flex-col w-full p-2">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-8rem)]">
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
                                        </svg>
                                    </button>
                                    <span className="group-hover:opacity-100 transition-opacity bg-gray-800 px-2 text-sm text-gray-100 rounded-md absolute -translate-x-2/3 translate-y-full opacity-0 m-3 mx-auto">
                                        Submit
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {needOfferings.map((course, index) => {
                            return (
                                <tr className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600" key={index}>
                                    <td className="p-2">
                                        {course[8]}
                                    </td>
                                    <td className="p-2">
                                        {`${course[1]} ${course[2]}`}
                                    </td>
                                    <td className="p-2">
                                        <input type="text" onChange={(e) => handleOfferingChange(e, course)} maxLength={3} minLength={3}
                                            className="block text-md text-white border border-gray-600 rounded-lg bg-gray-700 focus:outline-none placeholder-gray-400 p-1 w-12" />
                                    </td>
                                    <td className="p-2">
                                        {course[4]}
                                    </td>
                                    <td className="p-2">
                                        {course[7]}
                                    </td>
                                    <td>

                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end px-2 py-1 sm:text-sm lg:text-lg">{needOfferings.length} / {dataLength}</div>
        </div>
    )
}