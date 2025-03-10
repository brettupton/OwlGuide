import { useEffect, useState } from "react"
import { BackArrow, Spinner } from "../components"
import MultiSelect from "../components/MultiSelect"
import { useRouter } from "next/router"

interface IReport {
    id: string
    name: string
}

export default function ReportPage() {
    const reports: IReport[] = [
        // {
        //     id: "crsadp",
        //     name: "Course Adoptions"
        // },
        // {
        //     id: "bkinv",
        //     name: "Inventory"
        // },
        {
            id: "recon",
            name: "Reconciliation"
        },
        // {
        //     id: "ordnrcd",
        //     name: "Ordered, Not Received"
        // },
        {
            id: "libr",
            name: "Library Adoptions"
        }
    ]

    const [isCSVReport, setIsCSVReport] = useState<boolean>(false)
    const [selectedReports, setSelectedReports] = useState<string[]>([])
    const [selectedTerms, setSelectedTerms] = useState<string[]>([])
    const [terms, setTerms] = useState<string[]>([])

    const router = useRouter()

    useEffect(() => {
        if (typeof window !== undefined && window.ipc) {
            window.ipc.send('main', { process: 'sql', method: 'get-terms' })

            window.ipc.on('term-list', (data: { terms: string[] }) => {
                setTerms(data.terms)
            })

            window.ipc.on('report-success', () => {
                router.reload()
            })
        }
    }, [])

    const handleToggleReport = (reportId: string) => {
        setSelectedReports((prev) =>
            prev.includes(reportId) ? prev.filter((i) => i !== reportId) : [...prev, reportId]
        )
    }

    const handleRequestReport = () => {
        if (selectedReports.length > 0 && selectedTerms.length > 0) {
            window.ipc.send('main', ({ process: 'report', method: 'request', data: { isCsv: isCSVReport, reqReports: selectedReports, reqTerms: selectedTerms } }))
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex flex-col m-4">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <div className="flex mb-2">
                            <span className="underline underline-offset-8">Report Type</span>
                        </div>
                        <div className="flex flex-col mb-4">
                            <div className="flex items-center mb-1">
                                <input id="xlsx" type="radio" checked={!isCSVReport} onChange={() => setIsCSVReport(false)} />
                                <label htmlFor="xlsx" className="ms-2 text-sm font-medium text-white">XLSX</label>
                            </div>
                            <div className="flex items-center">
                                <input id="csv" type="radio" checked={isCSVReport} onChange={() => setIsCSVReport(true)} />
                                <label htmlFor="csv" className="ms-2 text-sm font-medium text-white">CSV</label>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex">
                            <span className="underline underline-offset-8">Term(s)</span>
                        </div>
                        <div className="flex mt-2">
                            {terms.length <= 0 ?
                                <Spinner /> :
                                <MultiSelect
                                    options={terms.filter((term) => !["0", "Q", "I"].includes(term[0]))}
                                    selectedItems={selectedTerms}
                                    setSelectedItems={setSelectedTerms}
                                    maxNumOptions={6}
                                />
                            }
                        </div>
                    </div>
                </div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-4rem)]">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="p-2">
                                    Report
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => {
                                return (
                                    <tr
                                        className="bg-gray-800 text-sm border-b border-gray-700 cursor-pointer active:scale-95 transition-transform duration-85"
                                        key={index}
                                        onClick={() => handleToggleReport(report.id)}>
                                        <td className={`p-2 ${selectedReports.includes(report.id) ? "bg-gray-400" : "hover:bg-gray-400"}`}>
                                            {report.name}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex w-full text-sm mt-3">
                    <button
                        className={`bg-white text-gray-800 font-semibold w-1/8 py-2 px-4 border border-gray-400 rounded shadow text-center ${selectedReports.length > 0 && selectedTerms.length > 0 ? "hover:bg-gray-300 active:scale-95 transition-transform duration-75" : "cursor-not-allowed"}`}
                        disabled={selectedReports.length <= 0 && selectedTerms.length <= 0}
                        title="Select Term and Report"
                        onClick={handleRequestReport}
                    >Download</button>
                </div>
            </div>
        </div>
    )
}