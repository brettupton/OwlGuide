import { Adoption } from '../../../types/Adoption'

interface AdoptionTableProps {
    AdoptionData: Adoption[]
    activeTab: string
    adoptionsAdded: number
    handleTemplateAdd: (course: string, title: string) => void
    AdoptionTableRef: any
}

export default function AdoptionTemplateTable({ AdoptionData, activeTab, adoptionsAdded, handleTemplateAdd, AdoptionTableRef }: AdoptionTableProps) {
    const filteredAdoptData = AdoptionData.filter((course) => {
        if (activeTab === 'All') return true
        if (activeTab === 'Sub' && course.Status === "Submitted") return true
        if (activeTab === 'Unsub' && course.Status === "Not Submitted") return true
        return false
    })


    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-6.8rem)]">
                <table className="w-full sm:text-sm lg:text-md text-left rtl:text-right" ref={AdoptionTableRef}>
                    <thead className="text-gray-200 uppercase border-b bg-gray-600 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Course
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Professor
                            </th>
                            <th scope="col" className="px-6 py-3">

                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdoptData.map((course: Adoption, key: number) => {
                            return (
                                <tr className="border-b border-white text-gray-200 font-semibold" key={key}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {course.Course}
                                    </td>
                                    <td className="px-6 py-4">
                                        {course.Title}
                                    </td>
                                    <td className="px-6 py-4">
                                        {course.Professor}
                                    </td>
                                    {activeTab === "Unsub" &&
                                        <td className="px-6 py-4">
                                            <button type="button" onClick={() => handleTemplateAdd(course.Course, course.Title)}
                                                className="flex justify-center items-center select-none rounded-full shadow focus:outline-none focus:shadow-outline">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                            </button>
                                        </td>
                                    }
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end px-2 py-1 sm:text-sm lg:text-lg">{adoptionsAdded} / {filteredAdoptData.length} / {AdoptionData.length}</div>
        </div>
    )
}