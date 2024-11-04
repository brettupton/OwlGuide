import { ChangeEvent, useEffect, useState } from "react"
import Spinner from "./Spinner"

export default function TermSelect({ process, latest }: { process: string, latest?: boolean }) {
    const [terms, setTerms] = useState<string[]>([])

    useEffect(() => {
        if (typeof window !== undefined && window.ipc) {
            window.ipc.send('sql', { method: 'get-terms' })

            window.ipc.on('term-list', (data: { terms: string[] }) => {
                if (latest) {
                    // Get latest three years for all terms in list
                    const grouped = data.terms.reduce((acc, term) => {
                        const termLetter = term[0]
                        const year = parseInt(term.slice(1), 10)

                        if (!acc[termLetter]) {
                            acc[termLetter] = []
                        }
                        acc[termLetter].push(year)
                        return acc
                    }, {})

                    const latestTerms = Object.keys(grouped).map(term => {
                        const maxYear = Math.max(...grouped[term])
                        return `${term}${maxYear}`
                    })
                    setTerms(latestTerms)
                } else {
                    setTerms(data.terms)
                }
            })
        }
    }, [])

    const handleTermChoice = (e: ChangeEvent<HTMLSelectElement>) => {
        if (e.currentTarget.value) {
            const term = e.currentTarget.value
            window.ipc.send(`${process}`, { method: 'get-term-decision', data: { term } })
        }
    }

    return (
        <div className="flex w-full justify-center">
            {terms.length <= 0 ?
                <Spinner />
                :
                <select
                    className="border text-sm rounded-lg block p-1 bg-gray-700 border-gray-600 text-white"
                    onChange={handleTermChoice}
                >
                    <option value="">Term</option>
                    {terms.map((term, index) => {
                        return !["0", "Q", "I"].includes(term[0]) &&
                            <option key={index}>{term}</option>

                    })}
                </select>
            }
        </div>
    )
}