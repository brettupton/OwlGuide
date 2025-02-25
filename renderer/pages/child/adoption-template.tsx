import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react"
import { NoAdoption } from "../../../types/Adoption"
import Image from "next/image"

export default function AdoptionTemplate() {
    const [tempAdoptions, setTempAdoptions] = useState<NoAdoption[]>([])
    const [selectedTerm, setSelectedTerm] = useState<string>("")

    // const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)
    const filterHeaders = ["ID", "Prof", "CRN", "Title"]

    useEffect(() => {
        window.ipc.send('ready-to-receive')

        window.ipc.on('close-success', () => {
            handleSendAll(true)
        })

        window.ipc.on('download-success', () => {
            window.ipc.send('close-child', { childId: "adoption-template", promptClose: false })
        })

        window.ipc.on('sync-data', ({ course, term }: { course: NoAdoption | NoAdoption[], term: string }) => {
            setTempAdoptions((prev) => {
                const newCourseArr = Array.isArray(course) ? [...prev, ...course] : [...prev, course]
                return newCourseArr
                    .map((course) => {
                        // Initialize both keys that are missing from sent courses
                        course["NoText"] = false
                        course["ISBN"] = ""

                        return course
                    })
                    .sort((a, b) => a["Dept"].localeCompare((b["Dept"])) || a["Course"].localeCompare(b["Course"]) || a["Section"].localeCompare(b["Section"]))
            })

            setSelectedTerm(term)
        })
    }, [])

    const handleMinimize = () => {
        window.ipc.send('minimize-app')
    }

    const handleClose = () => {
        window.ipc.send('close-child', { childId: "adoption-template", promptClose: true })
    }

    const handleSend = (course: NoAdoption) => {
        // Remove initially set properties before sending
        delete course["NoText"]
        delete course["ISBN"]
        window.ipc.send('window-sync', { fromWindow: 'child', process: 'adoption', data: { course } })
        // Filter sent course from state
        setTempAdoptions((prev) => {
            return [...prev]
                .filter((adoption) => adoption["ID"] !== course["ID"])
        })
    }

    const handleSendAll = (closeWindow: boolean) => {
        setTempAdoptions((prev) => {
            const updatedCourses = prev.map((course) => {
                delete course["NoText"]
                delete course["ISBN"]
                return course
            })

            // Send the latest updatedCourses instead of relying on state
            window.ipc.send('window-sync', { window: 'child', process: 'adoption', data: { course: updatedCourses } })

            // If not closing, update state normally
            return closeWindow ? prev : prev.filter(course => !prev.includes(course))
        })
    }

    const handleCourseUpdate = (e: ChangeEvent<HTMLInputElement>, courseId: number) => {
        const { id, value } = e.currentTarget
        const courseIndex = tempAdoptions.findIndex((course) => course["ID"] === courseId)
        const currTemp = [...tempAdoptions]

        // Convert value to boolean equivalent on NoText update
        currTemp[courseIndex][id] = id === "NoText" ? value === "true" : value
        setTempAdoptions([...currTemp])
    }

    const handleDownloadCSV = () => {
        window.ipc.send('main', { process: 'adoption', method: 'download-csv', data: { adoptions: tempAdoptions, term: selectedTerm } })
    }

    return (
        <div>
            <header className="bg-gray-800 relative">
                <div className="flex px-2 py-1 justify-between">
                    <div className="flex window-controls">
                        <Image
                            src="/images/owl.png"
                            alt="Owl logo"
                            width={35}
                            height={35}
                            priority={true}
                        />
                    </div>
                    <div className="flex">
                        <div className="flex window-controls gap-2">
                            <button onClick={handleMinimize}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                </svg>
                            </button>
                            <button onClick={handleClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="flex flex-col m-3 relative overflow-x-auto max-h-[calc(100vh-5rem)]">
                {tempAdoptions.length > 0 &&
                    <table className="w-full text-sm text-left rtl:text-right text-white">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                {Object.keys(tempAdoptions[0]).map((header) => {
                                    return (
                                        !filterHeaders.includes(header) &&
                                        <th className={`p-2 ${header !== "ISBN" ? "text-center" : ""}`} key={header}>
                                            {header}
                                        </th>
                                    )
                                })}
                                <th className="px-2 py-1">
                                    <button title="Remove All" onClick={() => handleSendAll(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                        </svg>
                                    </button>
                                </th>
                                <th className="px-2 py-1">
                                    <button title="Download CSV" onClick={handleDownloadCSV}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tempAdoptions.map((adoption) => {
                                return (
                                    <tr
                                        className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600" key={`${adoption["ID"]}`}
                                        id={`${adoption["ID"]}`}
                                    >
                                        {Object.keys(adoption).map((key, index) => {
                                            return (
                                                !filterHeaders.includes(key) &&
                                                <td className={`p-2 ${key !== "ISBN" ? "text-center" : ""}`} key={`${adoption["ID"]}-${index}`}>
                                                    {key === "NoText" ?
                                                        <input
                                                            type="checkbox"
                                                            id="NoText"
                                                            checked={adoption["NoText"]}
                                                            disabled={adoption["ISBN"].length > 0}
                                                            value={String(!adoption["NoText"])}
                                                            onChange={(e) => handleCourseUpdate(e, adoption["ID"])} />
                                                        :
                                                        key === "ISBN" ?
                                                            <input
                                                                type="text"
                                                                id="ISBN"
                                                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-1"
                                                                disabled={adoption["NoText"]}
                                                                value={adoption["ISBN"]}
                                                                maxLength={13}
                                                                onChange={(e) => handleCourseUpdate(e, adoption["ID"])}
                                                            />
                                                            :
                                                            adoption[key]}
                                                </td>
                                            )
                                        })}
                                        <td className="px-2 hover:cursor-pointer" onClick={() => handleSend(adoption)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </td>
                                        <td className="px-2">

                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}