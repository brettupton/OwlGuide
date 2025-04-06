import { useEffect, useRef, useState } from "react"
import { BackArrow, TermSelect } from "../components"
import { PurchaseOrder } from "../../types/Order"
import OrdersTable from "../components/tables/OrdersTable"

export default function OrderPage() {
    const [searchPO, setSearchPO] = useState<string>("")
    const [searchVendor, setSearchVendor] = useState<string>("")
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
    const [activePOId, setActivePOId] = useState<number>(0)
    const [status, setStatus] = useState<"All" | "Open" | "Closed">("All")
    const [isComplete, setIsComplete] = useState<boolean>(false)

    const tableRef = useRef(null)

    useEffect(() => {
        window.ipc.on('order-data', ({ orders }: { orders: PurchaseOrder[], term: string }) => {
            setPurchaseOrders([...orders])
        })
    }, [])

    const handleStatusChange = async (status: "All" | "Open" | "Closed") => {
        tableRef.current.scrollIntoView({ behaviour: 'auto' })
        setStatus(status)
        await new Promise(resolve => setTimeout(resolve, 1700))
    }

    const handleSearchPO = () => {
        if (searchPO.length > 0 || searchVendor.length > 0) {
            window.ipc.send('main', { process: 'order', method: 'search-po', data: { type: 'order', searchPO, searchVendor } })
        }
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex flex-col m-4">
                <div className="flex justify-between w-full">
                    <div className="flex">
                        <TermSelect process="order" />
                    </div>
                    <div className="flex items-center">
                        <input id="complete" type="checkbox" checked={isComplete} onChange={() => { setIsComplete(!isComplete) }} />
                        <label htmlFor="complete" className="ms-1 text-sm font-medium text-white">Ord &#62; Rcvd</label>
                    </div>
                    <div className="flex">
                        <div className="relative border-2 border-white px-2 py-1 w-full rounded-lg">
                            <div className="absolute -top-3 bg-sky-950 px-1 text-sm">
                                Status
                            </div>
                            <div className="flex gap-3">
                                <div className="flex items-center mb-1">
                                    <input id="all" type="radio" checked={status === "All"} onChange={() => handleStatusChange("All")} />
                                    <label htmlFor="all" className="ms-1 text-sm font-medium text-white">All</label>
                                </div>
                                <div className="flex items-center mb-1">
                                    <input id="open" type="radio" checked={status === "Open"} onChange={() => handleStatusChange("Open")} />
                                    <label htmlFor="open" className="ms-1 text-sm font-medium text-white">Open</label>
                                </div>
                                <div className="flex items-center mb-1">
                                    <input id="closed" type="radio" checked={status === "Closed"} onChange={() => handleStatusChange("Closed")} />
                                    <label htmlFor="closed" className="ms-1 text-sm font-medium text-white">Closed</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex">
                            <input type="text"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full px-2 py-1"
                                placeholder="PO #"
                                value={searchPO}
                                maxLength={5}
                                onChange={(e) => { setSearchPO(e.currentTarget.value) }}
                            />
                        </div>
                        <div className="flex w-full">
                            <input type="text"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full px-2 py-1"
                                placeholder="Vendor"
                                value={searchVendor}
                                onChange={(e) => { setSearchVendor(e.currentTarget.value) }}
                            />
                        </div>
                        <div className="flex">
                            <button className="bg-white hover:bg-gray-300 text-gray-800 font-semibold px-1 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
                                onClick={handleSearchPO}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex mt-3">
                    <OrdersTable
                        orders={purchaseOrders}
                        status={status}
                        isComplete={isComplete}
                        tableRef={tableRef}
                        activeRow={activePOId}
                        setActiveRow={setActivePOId}
                    />
                </div>
            </div>
        </div>
    )
}