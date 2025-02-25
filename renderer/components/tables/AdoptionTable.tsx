import { MutableRefObject, Dispatch, SetStateAction, MouseEvent } from 'react'
import { NoAdoption } from '../../../types/Adoption'

interface AdoptionTableProps {
    adoptions: NoAdoption[]
    status: "All" | "NoText" | "Prev"
    selectedTerm: string
    tableRef: MutableRefObject<HTMLTableElement>
    activeRow: number
    setActiveRow: Dispatch<SetStateAction<number>>
    addCourse: (course: NoAdoption) => void
    addCourses: (courses: NoAdoption[]) => void
}

export default function AdoptionTable({ adoptions, status, selectedTerm, tableRef, activeRow, setActiveRow, addCourse, addCourses }: AdoptionTableProps) {
    const noTextDept = ["APPL", "ARTF", "BIOS", "BRND", "CHEB", "COAR", "FRLG", "GDES", "HEMS", "HGEN", "INNO", "PAPR", "PATC", "PCEU", "PESC", "PHAR", "REAL", "SBHD", "SCPT", "SCTS", "SPCH", "SPTL", "SSOR", "STUA", "SYSM"]
    const noTextTitle = ["ASSISTANTSHIP", "CANDIDACY", "CAP SEM", "CAPSTONE", "DIRECTED", "DISSERTATION", "DOCTORAL", "EXPERIENCE", "EXTERNS", "EXTERNSHIP", "FIELD", "GRADUATE", "GUIDED", "INDEPDNT", "INDEPENDENT", "INDIVIDUAL", "INTERNS", "INTERNSH", "INTERNSHIP", "INTRNSHP", "PORTFOLIO", "PRAC", "PRACTICE", "PRACTICUM", "PRECEPTOR", "PRECEPTORSHIP", "RESEARCH", "RSCH", "RSRCH", "SEMINAR", "SR SEM", "STUDIO", "THESIS", "UNDERGRADUATE", "WORKSHOP"]

    const filtered = adoptions.filter((adoption) => {
        if (status === "NoText") {
            return noTextDept.includes(adoption["Dept"])
                || noTextTitle.some(title => adoption["Title"].includes(title))
                || adoption["Section"].indexOf("Q") >= 0
        }
        return true
    })

    const handleAdoptionWindow = (e: MouseEvent<HTMLTableCellElement>) => {
        const reqId = Number(e.currentTarget.id)
        const courseIndex = filtered.findIndex((course) => course["ID"] === reqId)

        setActiveRow(reqId)
        window.ipc.send('child', { process: 'adoption', data: { course: filtered[courseIndex], term: selectedTerm } })
    }

    return (
        <div className="w-full">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-13rem)]">
                {adoptions.length > 0 &&
                    <table className="w-full text-sm text-left rtl:text-right text-white" ref={tableRef}>
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                {Object.keys(adoptions[0]).map((header) => {
                                    return (
                                        header !== "ID" &&
                                        <th className="p-2" key={header}>{header}</th>
                                    )
                                })}
                                <th className="px-2 py-1">
                                    <button title="Add All" onClick={() => addCourses(filtered)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((adoption) => {
                                return (
                                    <tr
                                        className={`${activeRow === adoption["ID"] ? "bg-gray-600 border border-white ring-2 ring-white" : "bg-gray-800 border-b border-gray-700 hover:bg-gray-600"}`} key={`${adoption["ID"]}`}
                                    >
                                        {Object.keys(adoption).map((key, index) => {
                                            return (
                                                key !== "ID" &&
                                                <td
                                                    className={`p-2 ${typeof adoption[key] === "number" ? "text-center" : ""}`} key={`${adoption["ID"]}-${index}`}
                                                    onClick={handleAdoptionWindow}
                                                    id={`${adoption["ID"]}`}
                                                >
                                                    {adoption[key]}
                                                </td>
                                            )
                                        })}
                                        <td className="px-2 hover:cursor-pointer z-50" onClick={() => addCourse(adoption)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </div>
            <div className="text-xs text-end mt-1">
                {filtered.length} / {adoptions.length}
            </div>
        </div>
    )
}