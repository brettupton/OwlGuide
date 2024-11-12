import { Adoption } from '../../../types/Adoption'

interface AdoptionTableProps {
    AdoptionData: Adoption[]
}

export default function AdoptionTable({ adoptions }: { adoptions: DBRow[] }) {
    const fields = Object.keys(adoptions[0])
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-4rem)]">
            <table className="w-full text-sm text-left rtl:text-right">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                    <tr>
                        {fields.map((header, index) => {
                            return (
                                <th scope="col" className="p-2" key={index}>
                                    {header}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {adoptions.map((row, index: number) => {
                        return (
                            <tr className="bg-gray-800 text-xs border-b border-gray-700 hover:bg-gray-600">
                                {fields.map((field) => {
                                    return (
                                        <td key={`${row}${index}-${field}`} className="p-2">
                                            {row[field]}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}