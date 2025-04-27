<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { useState, useEffect } from "react"
import { Spinner } from "../../components"

export default function AdoptionDetailPage() {
    const [adoptions, setAdoptions] = useState([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        window.ipc.on('data', ({ prevAdoptions }: { prevAdoptions: [] }) => {
            setAdoptions([...prevAdoptions])
            setIsLoading(false)
=======
=======
>>>>>>> main
=======
>>>>>>> main
import { useState, useEffect, useRef, MutableRefObject } from "react"
import { Spinner } from "../../components"
import { PrevAdoption } from "../../../types/Adoption"

export default function AdoptionDetailPage() {
    const [adoptions, setAdoptions] = useState<PrevAdoption[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)

    useEffect(() => {
        window.ipc.on('data', ({ prevAdoptions }: { prevAdoptions: PrevAdoption[] }) => {
            setAdoptions([...prevAdoptions])
            setIsLoading(false)
            tableRef.current.scrollIntoView({ behavior: 'auto' })
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
=======
>>>>>>> main
        })

        window.ipc.send("ready-to-receive")
    }, [])

    return (
        <div className="m-4">
            {isLoading ?
<<<<<<< HEAD
<<<<<<< HEAD
                <Spinner />
                :
                adoptions.length > 0 ?
                    <div className="flex relative w-full overflow-x-auto max-h-[calc(100vh-1.5rem)]">
<<<<<<< HEAD
                        <table className="w-full text-sm text-left rtl:text-right text-white text-center">
=======
                        <table className="w-full text-sm text-left rtl:text-right text-white text-center" ref={tableRef}>
>>>>>>> main
=======
=======
>>>>>>> main
                <Spinner
                    size="md"
                    color="white"
                />
                :
                adoptions.length > 0 ?
                    <div className="flex relative w-full overflow-x-auto max-h-[calc(100vh-1.5rem)]">
                        <table className="w-full text-sm text-left rtl:text-right text-white text-center" ref={tableRef}>
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                <tr>
                                    {Object.keys(adoptions[0]).map((header, index) => {
                                        return (
                                            <th key={index} className="p-2">
                                                {header}
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {adoptions.map((term, index) => {
                                    return (
                                        <tr key={index} className="bg-gray-800 hover:bg-gray-600 border-b border-gray-700">
                                            {Object.keys(term).map((data, index) => {
                                                return (
                                                    <td key={`${term["Term"]}${index}`} className="px-2 py-1">
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                                                        {term[data]}
=======
=======
>>>>>>> main
=======
>>>>>>> main
                                                        {Array.isArray(term[data]) ?
                                                            <div className="flex flex-col">
                                                                {term[data].map((info) => {
                                                                    return (
                                                                        <div className="flex">{info}</div>
                                                                    )
                                                                })}
                                                            </div>
                                                            :
                                                            term[data]
                                                        }
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
=======
>>>>>>> main
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    :
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                    <div>No Previous Course Found</div>
=======
                    <div className="text-sm">No Previous Data Found</div>
>>>>>>> main
=======
                    <div className="text-sm">No Previous Data Found</div>
>>>>>>> main
=======
                    <div className="text-sm">No Previous Data Found</div>
>>>>>>> main
            }
        </div>
    )
}