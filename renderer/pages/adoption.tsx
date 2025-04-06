import { useState, ChangeEvent, useEffect, useRef, MutableRefObject } from "react"
import { NoAdoption } from "../../types/Adoption"
import { AdoptionTable, BackArrow, TermSelect } from "../components"

export default function AdoptionPage() {
    const [asstStatus, setAsstStatus] = useState<"All" | "NoText" | "Prev">("All")
    const [adoptions, setAdoptions] = useState<NoAdoption[]>([])
    const [activeCourseId, setActiveCourseId] = useState<number>(0)
    const [selectedTerm, setSelectedTerm] = useState<string>("")

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)

    useEffect(() => {
        window.ipc.on('adoption-data', ({ noAdoptions, term }: { noAdoptions: NoAdoption[], term: string }) => {
            setAdoptions([...noAdoptions])
            setSelectedTerm(term)
            setAsstStatus("All")
        })
    }, [])

    const handleAsstStatusChange = (status: "All" | "NoText" | "Prev") => {
        tableRef.current.scrollIntoView({ behavior: 'auto' })
        setAsstStatus(status)
    }

    const handleSend = (course: NoAdoption) => {
        window.ipc.send('window-sync', { fromWindow: 'main', process: 'adoption', data: { course, term: selectedTerm } })
    }

    const handleSendAll = (courses: NoAdoption[]) => {
        window.ipc.send('window-sync', { fromWindow: 'main', process: 'adoption', data: { course: courses, term: selectedTerm } })
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex flex-col m-4">
                <div className="flex w-full gap-2">
                    <div className="flex">
                        <TermSelect process="adoption" latest={true} />
                    </div>
                    <div className="flex">
                        <div className="relative border-2 border-white px-2 py-1 w-full rounded-lg">
                            <div className="absolute -top-3 bg-sky-950 px-1 text-sm">
                                Asst.
                            </div>
                            <div className="flex gap-3">
                                <div className="flex items-center mb-1">
                                    <input id="all" type="radio" checked={asstStatus === "All"} onChange={() => handleAsstStatusChange("All")} />
                                    <label htmlFor="all" className="ms-1 text-sm font-medium text-white">All</label>
                                </div>
                                <div className="flex items-center mb-1">
                                    <input id="noText" type="radio" checked={asstStatus === "NoText"} onChange={() => handleAsstStatusChange("NoText")} />
                                    <label htmlFor="noText" className="ms-1 text-sm font-medium text-white">No Text</label>
                                </div>
                                <div className="flex items-center mb-1">
                                    <input id="prev" type="radio" checked={asstStatus === "Prev"} onChange={() => handleAsstStatusChange("Prev")} />
                                    <label htmlFor="prev" className="ms-1 text-sm font-medium text-white">Prev</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex mt-3">
                    <AdoptionTable
                        adoptions={adoptions}
                        status={asstStatus}
                        selectedTerm={selectedTerm}
                        tableRef={tableRef}
                        activeRow={activeCourseId}
                        setActiveRow={setActiveCourseId}
                        addCourse={handleSend}
                        addCourses={handleSendAll}
                    />
                </div>
            </div>
        </div>
    )
}