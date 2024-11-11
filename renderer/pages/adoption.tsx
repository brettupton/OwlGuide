import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, ChangeEvent, useEffect, useRef } from "react"
import { Adoption } from "../../types/Adoption"
import { AdoptionTable } from "../components"

export default function AdoptionHome() {
    const [filePath, setFilePath] = useState<string>("")
    const [activeTab, setActiveTab] = useState<string>("All")
    const [adoptionData, setAdoptionData] = useState<Adoption[]>([])
    const [term, setTerm] = useState<string>("")
    const [campus, setCampus] = useState<string>("")
    const [adoptionsAdded, setAdoptionsAdded] = useState<number>(0)

    const AdoptionTableRef = useRef(null)

    const router = useRouter()

    const [bottomBarCreated, setBottomBarCreated] = useState<boolean>(false)

    const tabClasses = (tab: string) =>
        `inline-block px-3 py-1 rounded-t-lg ${activeTab === tab
            ? 'text-white bg-gray-600'
            : 'hover:text-white hover:bg-gray-600'
        }`

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('adoption-data', ({ allCourses, term, campus }: { allCourses: Adoption[], term: string, campus: string }) => {
                setAdoptionData(allCourses)
                setTerm(term)
                setCampus(campus)
            })

            window.ipc.on('download-success', () => {
                window.ipc.send('close-bars')
                router.refresh()
            })
        }
    }, [])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { files } = e.currentTarget

        if (files) {
            setFilePath(files[0].path)
        }
    }

    const handleSubmit = () => {
        if (filePath !== "") {
            window.ipc.send('adoption-upload', filePath)
        }
    }

    const handleTabClick = (tab: string) => {
        if (tab === "Unsub" && !bottomBarCreated) {
            setBottomBarCreated(true)
            window.ipc.send('create-template-window')
        }
        setActiveTab(tab)
        AdoptionTableRef.current.scrollIntoView()
    }

    const handleTemplateAdd = (Course: string, Title: string) => {
        window.ipc.send('new-template-course', { Course, Title, term, campus })
        setAdoptionsAdded(adoptionsAdded + 1)
    }

    return (
        <React.Fragment>
            <Head>
                <title>OwlGuide - Adoptions</title>
            </Head>
            <div className="grid grid-col-1 text-xl w-10 text-start pl-2 mt-2">
                <Link href="/home">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg>
                </Link>
            </div>
            {adoptionData.length > 0 ?
                <div>
                    <div className="flex justify-between items-center w-full text-sm">
                        <div className="text-left">
                            {term}
                        </div>
                        <ul className="flex flex-wrap justify-end text-sm font-medium text-center text-white">
                            <li className="me-1">
                                <a href="#" className={tabClasses('All')} onClick={() => handleTabClick('All')}>All</a>
                            </li>
                            <li className="me-1">
                                <a href="#" className={tabClasses('Sub')} onClick={() => handleTabClick('Sub')}>Sub</a>
                            </li>
                            <li className="me-1">
                                <a href="#" className={tabClasses('Unsub')} onClick={() => handleTabClick('Unsub')}>Unsub</a>
                            </li>
                        </ul>
                    </div>
                    <AdoptionTable AdoptionData={adoptionData} activeTab={activeTab} adoptionsAdded={adoptionsAdded} handleTemplateAdd={handleTemplateAdd} AdoptionTableRef={AdoptionTableRef} />
                </div>
                :
                <div className="mt-3 ml-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-auto">
                            <input type="file" id="file" onChange={handleFileChange}
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
                        Course Submission Status
                    </label>
                </div>
            }
        </React.Fragment>
    )
}