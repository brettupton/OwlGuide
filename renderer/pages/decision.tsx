import React, { useState, useEffect, ChangeEvent, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import DecisionTable from '../components/DecisionTable'
import Decision from '../../types/Decision'

export default function BuyingDecision() {
  const [filePath, setFilePath] = useState<string>("")
  const [BDData, setBDData] = useState<Decision[]>([])
  const [activeTab, setActiveTab] = useState<string>('All')
  const [term, setTerm] = useState<string>("")

  const SalesTableRef = useRef(null)

  const tabClasses = (tab: string) =>
    `inline-block px-3 py-1 rounded-t-lg ${activeTab === tab
      ? 'text-white bg-gray-600'
      : 'hover:text-white hover:bg-gray-600'
    }`

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.on('new-decision', ({ term, newBD }: { term: string, newBD: Decision[] }) => {
        setBDData([...newBD])
        setTerm(term)
      })
    }
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget

    if (files) {
      setFilePath(files[0].path)
    }
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    SalesTableRef.current.scrollIntoView({ behavior: "auto" })
  }

  const handleISBNClick = (isbn: string) => {
    window.ipc.send('isbn-lookup', { isbn, term })
  }

  const handleSubmit = () => {
    if (filePath !== "") {
      window.ipc.send('decision-upload', { filePath: filePath })
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>OwlGuide - Buying Decision</title>
      </Head>
      <div className="grid grid-col-1 text-xl w-10 text-start pl-2 mt-2">
        <Link href="/home">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
          </svg>
        </Link>
      </div>
      {Object.keys(BDData).length < 1
        ?
        <div className="mt-3 ml-3">
          <div className="flex items-center space-x-2">
            <div className="w-auto">
              <input type="file" id="file" onChange={handleFileChange} accept=".txt"
                className="block text-md text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none  placeholder-gray-400" />
            </div>
            <div className="w-auto">
              <button onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 active:scale-95 transition-transform duration-75">
                Submit
              </button>
            </div>
          </div>
          <label htmlFor="file" className="block mt-1 text-sm font-medium text-white">
            Sequence: Title, ISBN, Est Sales, Act Enrl
          </label>
        </div>
        :
        <>
          <ul className="flex flex-wrap justify-end text-sm font-medium text-center text-white border-b border-white">
            <li className="me-1">
              <a href="#" className={tabClasses('All')} onClick={() => handleTabClick('All')}>All</a>
            </li>
            <li className="me-1">
              <a href="#" className={tabClasses('EQ0')} onClick={() => handleTabClick('EQ0')}>&#61;0</a>
            </li>
            <li className="me-1">
              <a href="#" className={tabClasses('LT5')} onClick={() => handleTabClick('LT5')}>&lt;5</a>
            </li>
            <li className="me-1">
              <a href="#" className={tabClasses('QT5')} onClick={() => handleTabClick('QT5')}>&#8805;5</a>
            </li>
          </ul>
          <DecisionTable BDData={BDData} activeTab={activeTab} handleISBNClick={handleISBNClick} SalesTableRef={SalesTableRef} />
        </>
      }
    </React.Fragment>
  )
}
