import { DecisionSales } from "../../../types/Decision"

interface SalesTableProps {
    sales: DecisionSales[]
}

export default function SalesTable({ sales }: SalesTableProps) {
    const fields = Object.keys(sales[0])

    return (
        <div className="flex flex-col w-full pt-2">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg min-h-full table-fixed">
                <table className="w-full text-sm text-left rtl:text-right text-white">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {fields.map((header, index) => {
                                return (
                                    <th scope="col" className="p-1 text-center" key={index}>
                                        {header}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((row, index) => {
                            return (
                                index !== (sales.length - 1) &&
                                <tr className={`${sales[index]["Term"] === "Avg" ? 'bg-gray-500 border border-gray-700' : 'bg-gray-800 hover:bg-gray-600 border-b border-gray-700'}`}
                                    key={index}>
                                    {fields.map((field) => {
                                        return (
<<<<<<< HEAD
                                            <td className="p-1 text-center">
=======
                                            <td className="p-1 text-center" key={`${index * 20}-${field}`}>
>>>>>>> main
                                                {row[field]}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                        <tr className="bg-gray-500 border border-gray-700 sticky bottom-0">
<<<<<<< HEAD
                            {fields.map((field) => {
                                return (
                                    <td className="p-1 text-center">
=======
                            {fields.map((field, index) => {
                                return (
                                    <td className="p-1 text-center" key={`${field}-${index}`}>
>>>>>>> main
                                        {sales.at(-1)[field]}
                                    </td>
                                )
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}