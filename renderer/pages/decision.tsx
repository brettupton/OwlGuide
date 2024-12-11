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
        const sorted = data.decisions.sort((a, b) => a["Title"].localeCompare(b["Title"]))
        setDecision(sorted)
        setTerm(data.term)
      })
    }
  }, [])

  const handleRowClick = (isbn: string, title: string) => {
    setActiveBook({
      ISBN: isbn,
      Title: title
    })
    window.ipc.send('decision', { method: 'child-decision', data: { term, isbn, title } })
  }

  const handleTabClick = (tab: TableTab) => {
    setActiveTab(tab)
    tableRef.current.scrollIntoView({ behavior: "auto" })
  }

  return (
    <div className="flex h-full flex-col">
      <BackArrow path="home" />
      {decision.length > 0
        ?
        <div className="flex flex-col">
          <div className="flex mx-2 border-b border-white text-sm font-medium justify-between">
            <div className="flex">
              Term: {term}
            </div>
            <ul className="flex">
              {Object.keys(tabs).map((tab: TableTab, index) => {
                return (
                  <li className="me-1 text-center" key={index}>
                    <button className={tabClasses(tab)} onClick={() => handleTabClick(tab)}>{tabs[tab]}</button>
                  </li>
                )
              })}
            </ul>
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
