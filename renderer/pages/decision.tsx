import React, { useState, useEffect, useRef } from 'react'
import { Decision, TableTab } from '../../types/Decision'
import { BackArrow, DecisionTable, TermSelect } from '../components'

export default function BuyingDecision() {
  const [decision, setDecision] = useState<Decision[]>([])
  const [activeBook, setActiveBook] = useState<{ ISBN: string, Title: string }>()
  const [term, setTerm] = useState<string>("")
  const [activeTab, setActiveTab] = useState<TableTab>("All")

  const tabs = {
    "All": <>All</>,
    "EQ0": <>&#61;0</>,
    "LT5": <>&lt;5</>,
    "GT5": <>&#8805;5</>
  }

  const tableRef = useRef(null)

  const tabClasses = (tab: string) =>
    `inline-block px-3 py-1 rounded-t-lg ${activeTab === tab
      ? 'text-white bg-gray-600'
      : 'hover:text-white hover:bg-gray-600'
    }`

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.on('decision-data', (data: any) => {
        // const sorted = data.decisions.sort((a, b) => a["Title"].localeCompare(b["Title"]))
        setDecision(data.decisions)
        setTerm(data.term)
      })
    }
  }, [])

  const handleRowClick = (isbn: string, title: string) => {
    setActiveBook({
      ISBN: isbn,
      Title: title
    })
    window.ipc.send('child', { process: 'decision', data: { term, isbn, title } })
  }

  const handleTabClick = (tab: TableTab) => {
    setActiveTab(tab)
    tableRef.current.scrollIntoView({ behavior: "auto" })
  }

  const handleReset = () => {
    setDecision([])
    setTerm("")
    setActiveBook(undefined)
    setActiveTab("All")
    window.ipc.send('close-child', { childId: "decision-data", promptClose: false })
  }

  return (
    <div className="flex h-full flex-col">
      <BackArrow path="home" />
      {decision.length > 0
        ?
        <div className="flex flex-col">
          <div className="flex mx-2 border-b border-white text-sm font-medium justify-between">
            <ul className="flex">
              {Object.keys(tabs).map((tab: TableTab, index) => {
                return (
                  <li className="me-1 text-center" key={index}>
                    <button className={tabClasses(tab)} onClick={() => handleTabClick(tab)}>{tabs[tab]}</button>
                  </li>
                )
              })}
            </ul>
            <div className="flex gap-2">
              <div className="flex text-md font-bold border border-white rounded px-2 py-1">{term}</div>
              <div className="flex">
                <button
                  className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-1 px-1 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
                  onClick={handleReset}>Change</button>
              </div>
            </div>
          </div>
          <DecisionTable
            data={decision}
            handleRowClick={handleRowClick}
            activeBook={activeBook}
            activeTab={activeTab}
            tableRef={tableRef}
          />
        </div>
        :
        <div className="flex flex-col items-center">
          <TermSelect process="decision" latest={true} />
        </div>
      }
    </div>
  )
}
