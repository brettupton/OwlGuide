import { ChangeEvent, useEffect, useState } from "react"
import { BackArrow, FileForm, Spinner } from "../components"
import { BannerTerm } from "../../types/Enrollment"
import ProgressBar from "../components/ProgressBar"
import { useRouter } from "next/navigation"

export default function EnrollmentPage() {
    const [terms, setTerms] = useState<string[]>([])
    const [termOptions, setTermOptions] = useState<BannerTerm[]>()
    const [selectedTerm, setSelectedTerm] = useState<string>("")

    const router = useRouter()

    useEffect(() => {
        window.ipc.send('main', { process: 'enrollment', method: 'get-api-terms', data: { type: 'enrollment' } })

        window.ipc.on('terms-data', ({ terms }: { terms: BannerTerm[] }) => {
            setTermOptions(terms.map((term) => term))
            setTerms(terms.map((term) => term.description))
        })

        window.ipc.on('file-canceled', () => {
            router.refresh()
        })

        window.ipc.on('download-success', () => {
            router.refresh()
        })
    }, [])

    const handleTermChoice = (e: ChangeEvent<HTMLSelectElement>) => {
        const termChoice = e.currentTarget.value

        if (termChoice) {
            setSelectedTerm(termChoice)
            const termOpt = termOptions.find((option) => option.description === termChoice)
            window.ipc.send('main', { process: 'enrollment', method: 'get-api-sections', data: { type: 'enrollment', term: termOpt } })
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex justify-center">
                {terms.length > 0 && selectedTerm.length > 0
                    ?
                    <div className="flex w-1/2">
                        <ProgressBar title={`${selectedTerm} Enrollment`} />
                    </div>
                    :
                    <div className="flex flex-col gap-5">
                        <div className="flex">
                            {/* <FileForm process="enrollment" label="Enrollment File" /> */}
                        </div>
                        <div className="flex justify-center">
                            {
                                terms.length > 0
                                    ?
                                    <select
                                        className={`border text-sm rounded-lg block px-1 py-2 bg-gray-700 border-gray-600 text-white ${selectedTerm ? "ring-2 ring-white" : ""}`}
                                        onChange={handleTermChoice}
                                    >
                                        <option value="">Term</option>
                                        {terms.map((term, index) => {
                                            return (
                                                <option value={term} key={index}>{term}</option>
                                            )
                                        })}
                                    </select>
                                    :
                                    <Spinner size="md" color="white" />
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}