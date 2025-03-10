import { useState, useEffect, useRef } from 'react'
import { Decision, TableTab } from '../../types/Decision'
import { BackArrow, DecisionTable, TermSelect } from '../components'

export default function BuyingDecision() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [activeBookId, setActiveBookId] = useState<number>(0)
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [activeTab, setActiveTab] = useState<TableTab>("All")
  const [isSorted, setIsSorted] = useState<boolean>(true)

  const tabs = {
    "All": <>All</>,
    "EQ0": <>&#61;0</>,
    "LT5": <>&lt;5</>,
    "GT5": <>&#8805;5</>
  }

  const tableRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.on('decision-data', ({ decisions, term }: { decisions: Decision[], term: string }) => {
        setDecisions(decisions)
        setSelectedTerm(term)
      })
    }
  }, [])

  const handleRowClick = (row: Decision) => {
    setActiveBookId(row["ID"])
    window.ipc.send('child', { process: 'decision', data: { term: selectedTerm, bookId: row["ID"], ISBN: row["ISBN"], Title: row["Title"] } })
  }

  const handleTabClick = (tab: TableTab) => {
    setActiveTab(tab)
    tableRef.current.scrollIntoView({ behavior: "auto" })
  }

  const handleSortDecisions = (key: string) => {
    setDecisions((prev) => {
      setIsSorted(!isSorted)
      return [...prev]
        .sort((a, b) => {
          if (isSorted) {
            return a[key].localeCompare(b[key])
          } else {
            return b[key].localeCompare(a[key])
          }
        })
    })
  }

  return (
    <div className="flex flex-col">
      <BackArrow />
      <div className="flex flex-col m-4">
        <div className="flex w-full gap-2">
          <div className="flex">
            <TermSelect process="decision" latest={true} />
          </div>
          <div className="flex">
            <div className="relative border-2 border-white px-2 py-1 w-full rounded-lg">
              <div className="absolute -top-3 bg-sky-950 px-1 text-sm">
                Diff.
              </div>
              <div className="flex gap-3">
                {Object.keys(tabs).map((tab) => {
                  return (
                    <div className="flex items-center mb-1" key={tab}>
                      <input id="all" type="radio" checked={activeTab === tab} onChange={() => handleTabClick(tab as TableTab)} />
                      <label htmlFor="all" className="ms-1 text-sm font-medium text-white">{tabs[tab]}</label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex mt-3">
          <DecisionTable
            decisions={decisions}
            status={activeTab}
            selectedTerm={selectedTerm}
            tableRef={tableRef}
            activeRow={activeBookId}
            setActiveRow={handleRowClick}
            handleSort={handleSortDecisions}
          />
        </div>
      </div>
    </div>
  )
}
