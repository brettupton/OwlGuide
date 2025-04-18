import { ChangeEvent, useEffect, useState } from "react"
import Spinner from "./Spinner"

export default function TermSelect({ process, latest }: { process: string, latest?: boolean }) {
    const [terms, setTerms] = useState<string[]>([])
    const [selectedTerm, setSelectedTerm] = useState<string>("")

    useEffect(() => {
        window.ipc.send('main', { process: 'sql', method: 'get-terms', data: { type: 'sql' } })

        window.ipc.on('term-list', ({ terms }: { terms: string[] }) => {
            if (latest) {
                // Get latest three term years for shorter list selection
                const sortedTerms = [...terms]
                    .sort((a, b) => {
                        const termLetterA = a[0]
                        const termYearA = parseInt(a.slice(1), 10)
                        const termLetterB = b[0]
                        const termYearB = parseInt(b.slice(1), 10)

                        if (termYearA === termYearB) {
                            return termLetterA.localeCompare(termLetterB)
                        }
                        return termYearA - termYearB
                    }).slice(-3)
                setTerms(sortedTerms)
            } else {
                setTerms(terms)
            }
        })
    }, [])

    const handleTermChoice = (e: ChangeEvent<HTMLSelectElement>) => {
        if (e.currentTarget.value) {
            const term = e.currentTarget.value
            const method = `get-term-${process}`
            const courseData = process === 'course' ? { limit: 30, isForward: true, isSearch: false, pivotCourse: { Dept: "", Course: "", Section: "" } } : {}

            window.ipc.send('main', { process, method, data: { type: process, term, ...courseData } })
            setSelectedTerm(term)
        }
    }

    return (
        <div className="flex w-full justify-center">
            {terms.length <= 0 ?
                <div className="flex">
                    <Spinner
                        size="md"
                        color="white"
                    />
                </div>
                :
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
            }
        </div >
    )
}