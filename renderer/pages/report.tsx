import { useEffect, useState } from "react"
import { BackArrow, Spinner } from "../components"
import MultiSelect from "../components/MultiSelect"
import { useRouter } from "next/router"
<<<<<<< HEAD
<<<<<<< HEAD

interface IReport {
    id: string
=======
=======
>>>>>>> main
import { reportMap } from "../../types/ReportType"
import { Button } from "../components/Button"

interface IReport {
    id: "libr" | "recon" | "otb"
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
    name: string
}

export default function ReportPage() {
    const reports: IReport[] = [
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
        // {
        //     id: "crsadp",
        //     name: "Course Adoptions"
        // },
        // {
        //     id: "bkinv",
        //     name: "Inventory"
        // },
<<<<<<< HEAD
<<<<<<< HEAD
        {
            id: "recon",
            name: "Reconciliation"
        },
=======
>>>>>>> main
=======
>>>>>>> main
        // {
        //     id: "ordnrcd",
        //     name: "Ordered, Not Received"
        // },
<<<<<<< HEAD
<<<<<<< HEAD
        {
            id: "libr",
            name: "Library Adoptions"
        }
=======
>>>>>>> main
=======
>>>>>>> main
    ]

    const [isCSVReport, setIsCSVReport] = useState<boolean>(false)
    const [selectedReports, setSelectedReports] = useState<string[]>([])
    const [selectedTerms, setSelectedTerms] = useState<string[]>([])
    const [terms, setTerms] = useState<string[]>([])
<<<<<<< HEAD
<<<<<<< HEAD
=======
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
>>>>>>> main
=======
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
>>>>>>> main

    const router = useRouter()

    useEffect(() => {
<<<<<<< HEAD
<<<<<<< HEAD
        if (typeof window !== undefined && window.ipc) {
            window.ipc.send('main', { process: 'sql', method: 'get-terms' })

            window.ipc.on('term-list', (data: { terms: string[] }) => {
                setTerms(data.terms)
            })

            window.ipc.on('report-success', () => {
                router.reload()
            })
        }
=======
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
    }, [])

    const handleToggleReport = (reportId: string) => {
        setSelectedReports((prev) =>
            prev.includes(reportId) ? prev.filter((i) => i !== reportId) : [...prev, reportId]
        )
    }

    const handleRequestReport = () => {
        if (selectedReports.length > 0 && selectedTerms.length > 0) {
<<<<<<< HEAD
<<<<<<< HEAD
            window.ipc.send('main', ({ process: 'report', method: 'request', data: { isCsv: isCSVReport, reqReports: selectedReports, reqTerms: selectedTerms } }))
=======
            setIsGenerating(true)
            window.ipc.send('main', ({ process: 'report', method: 'request', data: { type: 'report', isCsv: isCSVReport, reqReports: selectedReports, reqTerms: selectedTerms } }))
>>>>>>> main
=======
            setIsGenerating(true)
            window.ipc.send('main', ({ process: 'report', method: 'request', data: { type: 'report', isCsv: isCSVReport, reqReports: selectedReports, reqTerms: selectedTerms } }))
>>>>>>> main
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex flex-col m-4">
                <div className="flex gap-4">
                    <div className="flex flex-col">
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="p-2">
                                    Report
                                </th>
<<<<<<< HEAD
<<<<<<< HEAD
=======
                                <th scope="col" className="p-2">
                                    Values
                                </th>
>>>>>>> main
=======
                                <th scope="col" className="p-2">
                                    Values
                                </th>
>>>>>>> main
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => {
<<<<<<< HEAD
<<<<<<< HEAD
                                return (
                                    <tr
                                        className="bg-gray-800 text-sm border-b border-gray-700 cursor-pointer active:scale-95 transition-transform duration-85"
                                        key={index}
                                        onClick={() => handleToggleReport(report.id)}>
                                        <td className={`p-2 ${selectedReports.includes(report.id) ? "bg-gray-400" : "hover:bg-gray-400"}`}>
                                            {report.name}
                                        </td>
=======
=======
>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex w-full text-sm mt-3">
<<<<<<< HEAD
<<<<<<< HEAD
                    <button
                        className={`bg-white text-gray-800 font-semibold w-1/8 py-2 px-4 border border-gray-400 rounded shadow text-center ${selectedReports.length > 0 && selectedTerms.length > 0 ? "hover:bg-gray-300 active:scale-95 transition-transform duration-75" : "cursor-not-allowed"}`}
                        disabled={selectedReports.length <= 0 && selectedTerms.length <= 0}
                        title="Select Term and Report"
                        onClick={handleRequestReport}
                    >Download</button>
=======
=======
>>>>>>> main
                    <Button
                        parentComponent="report"
                        text="Download"
                        isLoading={isGenerating}
                        icon="none"
                        isDisabled={selectedReports.length <= 0 || selectedTerms.length <= 0}
                        title={`${selectedReports.length <= 0 || selectedTerms.length <= 0 ? "Select Term(s) & Report(s)" : "Download Report(s)"}`}
                        buttonCommand={handleRequestReport}
                    />
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                </div>
            </div>
        </div>
    )
}