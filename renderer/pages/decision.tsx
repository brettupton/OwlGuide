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
<<<<<<< HEAD
<<<<<<< HEAD
      window.ipc.on('decision-data', (data: any) => {
        // const sorted = data.decisions.sort((a, b) => a["Title"].localeCompare(b["Title"]))
        setDecision(data.decisions)
        setTerm(data.term)
=======
      window.ipc.on('decision-data', ({ decisions, term }: { decisions: Decision[], term: string }) => {
        setDecisions(decisions)
        setSelectedTerm(term)
>>>>>>> main
=======
      window.ipc.on('decision-data', ({ decisions, term }: { decisions: Decision[], term: string }) => {
        setDecisions(decisions)
        setSelectedTerm(term)
>>>>>>> main
      })
    }
  }, [])

<<<<<<< HEAD
<<<<<<< HEAD
  const handleRowClick = (isbn: string, title: string) => {
    setActiveBook({
      ISBN: isbn,
      Title: title
    })
    window.ipc.send('child', { process: 'decision', data: { term, isbn, title } })
=======
  const handleRowClick = (row: Decision) => {
    setActiveBookId(row["ID"])
    window.ipc.send('child', { process: 'decision', data: { term: selectedTerm, bookId: row["ID"], ISBN: row["ISBN"], Title: row["Title"] } })
>>>>>>> main
=======
  const handleRowClick = (row: Decision) => {
    setActiveBookId(row["ID"])
    window.ipc.send('child', { process: 'decision', data: { term: selectedTerm, bookId: row["ID"], ISBN: row["ISBN"], Title: row["Title"] } })
>>>>>>> main
  }

  const handleTabClick = (tab: TableTab) => {
    setActiveTab(tab)
    tableRef.current.scrollIntoView({ behavior: "auto" })
  }

<<<<<<< HEAD
<<<<<<< HEAD
  const handleReset = () => {
    setDecision([])
    setTerm("")
    setActiveBook(undefined)
    setActiveTab("All")
    window.ipc.send('close-child')
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
=======
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
=======
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
>>>>>>> main
    <div className="flex flex-col">
      <BackArrow />
      <div className="flex flex-col m-4">
        <div className="flex w-full gap-2">
          <div className="flex">
            <TermSelect process="decision" latest={true} />
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
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
