import React, { useState, useEffect } from 'react'
import DecisionTable from '../components/DecisionTable'
import { Decision } from '../../types/Decision'
import { BackArrow, FileForm } from '../components'

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
      <BackArrow path="/home" />
      {decision.length > 0
        ?
        <DecisionTable data={decision} term={term} handleRowClick={handleRowClick} activeBook={activeBook} />
        :
        <FileForm process="decision" label="Decision" accept=".xlsx,.xlsb" />
      }
    </div>
  )
}
