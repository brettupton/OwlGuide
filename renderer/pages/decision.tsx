import React, { useState, useEffect } from 'react'
import DecisionTable from '../components/DecisionTable'
import { Decision } from '../../types/Decision'
import { BackArrow, FileForm } from '../components'
import TermSelect from '../components/TermSelect'

export default function BuyingDecision() {
  const [decision, setDecision] = useState<Decision[]>([])
  const [activeBook, setActiveBook] = useState<{ ISBN: string, Title: string }>()
  const [term, setTerm] = useState<string>("")

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.on('decision-data', (data: any) => {
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
    window.ipc.send('decision', { method: 'child-decision', data: { term, isbn, title } })
  }

  return (
    <div className="flex h-full flex-col">
      <BackArrow path="home" />
      {decision.length > 0
        ?
        <DecisionTable data={decision} term={term} handleRowClick={handleRowClick} activeBook={activeBook} />
        :
        <div className="flex flex-col items-center">
          <FileForm process="decision" label="Decision" accept=".xlsx,.xlsb" />
          <TermSelect process="decision" latest={true} />
        </div>
      }
    </div>
  )
}
