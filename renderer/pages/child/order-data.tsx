import { useEffect, useState } from "react"
import { OrderInfo } from "../../../types/Order"
import { Spinner } from "../../components"

export default function OrderDetailPage() {
    const [order, setOrder] = useState<OrderInfo[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        window.ipc.on('data', ({ order }: { order: OrderInfo[] }) => {
            setOrder([...order])
            setIsLoading(false)
        })

        window.ipc.send("ready-to-receive")
    }, [])

    return (
        <div className="m-4">
            {isLoading ?
                <Spinner />
                :
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-1.5rem)]">
                    <table className="w-full text-sm text-left rtl:text-right text-white">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                {Object.keys(order[0]).map((header) => {
                                    return (
                                        header !== "ID" &&
                                        <th className="p-1" key={header}>{header}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {order.map((book, index) => {
                                return (
                                    <tr
                                        className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600" key={`${index}`}>
                                        {Object.keys(book).map((key, cellIndex) => {
                                            return (
                                                <td className={`p-1 ${typeof book[key] === "number" ? "text-center" : key === "Title" ? "truncate" : ""}`} key={`${index}-${cellIndex}`}>
                                                    {key === "UnitPrice" ? `$${book[key]}` : key === "Discount" ? `${book[key]}%` : book[key]}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}