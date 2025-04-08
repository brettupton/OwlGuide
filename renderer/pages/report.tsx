import { useEffect, useState } from "react"
import { BackArrow, Spinner } from "../components"
import MultiSelect from "../components/MultiSelect"
import { useRouter } from "next/router"
import { reportMap } from "../../types/ReportType"
import { Button } from "../components/Button"

interface IReport {
    id: "libr" | "recon" | "otb"
    name: string
}

export default function ReportPage() {
    const reports: IReport[] = [
        {
            id: "libr",
            name: "Library Adoptions"
        },
        {
            id: "recon",
            name: "Reconciliation"
        },
        {
            id: "otb",
            name: "Open To Buy"
        },
        // {
        //     id: "crsadp",
        //     name: "Course Adoptions"
        // },
        // {
        //     id: "bkinv",
        //     name: "Inventory"
        // },
        // {
        //     id: "ordnrcd",
        //     name: "Ordered, Not Received"
        // },
    ]

    const [isCSVReport, setIsCSVReport] = useState<boolean>(false)
    const [selectedReports, setSelectedReports] = useState<string[]>([])
    const [selectedTerms, setSelectedTerms] = useState<string[]>([])
    const [terms, setTerms] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState<boolean>(false)

    const router = useRouter()

    useEffect(() => {
        window.ipc.send('main', { process: 'sql', method: 'get-terms', data: { type: 'sql' } })

        window.ipc.on('term-list', (data: { terms: string[] }) => {
            setTerms(data.terms)
        })

        window.ipc.on('report-success', () => {
            router.reload()
        })

        window.ipc.on('file-canceled', () => {
            setIsGenerating(false)
        })
    }, [])

    const handleToggleReport = (reportId: string) => {
        setSelectedReports((prev) =>
            prev.includes(reportId) ? prev.filter((i) => i !== reportId) : [...prev, reportId]
        )
    }

    const handleRequestReport = () => {
        if (selectedReports.length > 0 && selectedTerms.length > 0) {
            setIsGenerating(true)
            window.ipc.send('main', ({ process: 'report', method: 'request', data: { type: 'report', isCsv: isCSVReport, reqReports: selectedReports, reqTerms: selectedTerms } }))
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex flex-col m-4">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <div className="flex">
                            <div className="relative border-2 border-white px-2 py-1 w-full rounded-lg">
                                <div className="absolute -top-3 bg-sky-950 px-1 text-sm">
                                    Type
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex items-center my-1">
                                        <input id="xlsx" type="radio" checked={!isCSVReport} onChange={() => setIsCSVReport(false)} />
                                        <label htmlFor="all" className="ms-1 text-sm font-medium text-white">XLSX</label>
                                    </div>
                                    <div className="flex items-center my-1">
                                        <input id="csv" type="radio" checked={isCSVReport} onChange={() => setIsCSVReport(true)} />
                                        <label htmlFor="noText" className="ms-1 text-sm font-medium text-white">CSV</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="relative border-2 border-white px-2 py-1 w-full rounded-lg">
                            <div className="absolute -top-3 bg-sky-950 text-sm">
                                Term(s)
                            </div>
                            <div className="flex">
                                <div className="flex items-center">
                                    {terms.length <= 0 ?
                                        <Spinner
                                            size="md"
                                            color="white"
                                        /> :
                                        <MultiSelect
                                            options={terms}
                                            selectedItems={selectedTerms}
                                            setSelectedItems={setSelectedTerms}
                                            maxNumOptions={3}
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mt-5 overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-4rem)]">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="p-2">
                                    Report
                                </th>
                                <th scope="col" className="p-2">
                                    Values
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => {
                                const reportValues = Object.keys(reportMap[report.id]).join(", ")
                                return (
                                    <tr
                                        className={`p-2 ${selectedReports.includes(report.id) ? "bg-gray-600" : "bg-gray-800"} border-b border-gray-700 hover:bg-gray-600 hover:cursor-pointer duration-300 active:scale-95`}
                                        key={index}
                                        onClick={() => handleToggleReport(report.id)}>
                                        <td className="p-2">
                                            {report.name}
                                        </td>
                                        <td className="p-2">
                                            {reportValues}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex w-full text-sm mt-3">
                    <Button
                        parentComponent="report"
                        text="Download"
                        isLoading={isGenerating}
                        icon="none"
                        isDisabled={selectedReports.length <= 0 || selectedTerms.length <= 0}
                        title={`${selectedReports.length <= 0 || selectedTerms.length <= 0 ? "Select Term(s) & Report(s)" : "Download Report(s)"}`}
                        buttonCommand={handleRequestReport}
                    />
                </div>
            </div>
        </div>
    )
}