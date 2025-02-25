import { Dispatch, MouseEvent, MutableRefObject, SetStateAction } from "react"
import { PurchaseOrder } from "../../../types/Order"

interface OrderTableProps {
    orders: PurchaseOrder[]
    status: "All" | "Open" | "Closed"
    isComplete: boolean
    tableRef: MutableRefObject<HTMLTableElement>
    activeRow: number
    setActiveRow: Dispatch<SetStateAction<number>>
}

export default function OrdersTable({ orders, status, isComplete, tableRef, activeRow, setActiveRow }: OrderTableProps) {
    const purchaseOrders = orders.map((order, index) => {
        // Format SentBy as proper case
        order["SentBy"] = order["SentBy"][0].toUpperCase() + order["SentBy"].substring(1).toLowerCase()
        order["Status"] = order["Status"].length <= 1 ? order["Status"] === "O" ? "Open" : "Closed" : order["Status"]
        // Format YYYYMMDD from database as MM/DD/YYYY
        order["CreatedOn"] = !order["CreatedOn"].includes("/") ? new Date(Date.UTC(Number(order["CreatedOn"].substring(0, 4)), Number(order["CreatedOn"].substring(4, 6)) - 1, Number(order["CreatedOn"].substring(6, 8)))).toLocaleDateString("en-US") : order["CreatedOn"]

        return order
    })

    const filtered = purchaseOrders.filter((order) => {
        if (status !== "All") {
            if (isComplete) {
                return order["Status"] === status && order["QtyRcvd"] < order["QtyOrd"]
            }
            return order["Status"] === status
        }
        return isComplete ? order["QtyRcvd"] < order["QtyOrd"] : true
    })

    const handleOrderWindow = (e: MouseEvent<HTMLTableRowElement>) => {
        const id = Number(e.currentTarget.id)

        setActiveRow(id)
        window.ipc.send('child', { process: 'order', data: { reqId: id } })
    }

    return (
        <div className="w-full">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-13.2rem)]">
                {orders.length > 0 &&
                    <table className="w-full text-sm text-left rtl:text-right text-white" ref={tableRef}>
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                {Object.keys(orders[0]).map((header) => {
                                    return (
                                        header !== "ID" &&
                                        <th className="p-2" key={header}>{header}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((order) => {
                                return (
                                    <tr
                                        className={`${activeRow === order["ID"] ? "bg-gray-600 border border-white ring-2 ring-white" : "bg-gray-800 border-b border-gray-700 hover:bg-gray-600"}`} key={`${order["ID"]}`}
                                        id={`${order["ID"]}`}
                                        onClick={handleOrderWindow}
                                    >
                                        {Object.keys(order).map((key, index) => {
                                            return (
                                                key !== "ID" &&
                                                <td className={`p-2 ${typeof order[key] === "number" ? "text-center" : ""}`} key={`${order["ID"]}-${index}`}>
                                                    {order[key]}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </div>
            <div className="text-xs text-end mt-1">
                {filtered.length} / {orders.length}
            </div>
        </div>
    )
}