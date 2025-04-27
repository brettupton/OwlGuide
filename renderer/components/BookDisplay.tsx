import Image from "next/image"
import { BookResult } from "../../types/Book"
import ZoomImage from "./ZoomImage"

export default function BookDisplay({ book }: { book: BookResult }) {
    const newPrice = parseInt(book.Discount) > 25 ? parseFloat(book.UnitPrice) : parseFloat(book.UnitPrice) / (1 - (25 / 100))
    const usedPrice = (newPrice * (1 - (25 / 100))).toFixed(2)

    return (
        <div className="flex flex-col mt-3">
            <div className="flex bg-gray-300 rounded-xl border border-white m-4 p-2 text-black h-[calc(50vh-4rem)]">
                <div className="flex flex-col md:flex-row bg-gray-800 text-white shadow-lg rounded-lg p-3 border border-gray-700 w-full">
                    <ZoomImage
                        src={book.Image}
                        alt={"book-cover"}
                    />
                    <div className="flex flex-col justify-between px-4 w-full">
                        <div>
                            <h2 className="text-lg font-semibold">{book.Title}</h2>
                            {book.Subtitle && <p className="text-sm text-gray-400">{book.Subtitle}</p>}
                            <p className="text-sm text-gray-300">
                                By <span className="font-medium">{book.Author}</span> ({book.AuthorLast})
                            </p>
                            <p className="text-xs text-gray-500">Edition: {book.Edition}</p>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            <p><span className="font-semibold">Vendor:</span> {book.Vendor}</p>
                            <p><span className="font-semibold">Publisher:</span> {book.Publisher}</p>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            <p><span className="font-semibold">ISBN:</span> {book.ISBN}</p>
                            <p><span className="font-semibold">ID:</span> {book.ID}</p>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                            <div className="grid grid-cols-2 mt-2 text-xs text-gray-400">
                                <p className="font-semibold">Unit Price: <span className="text-gray-200">${Number(book.UnitPrice).toFixed(2)}</span></p>
                                <p className="font-semibold">New Price: <span className="text-gray-200">${newPrice.toFixed(2)}</span></p>
                                <p className="font-semibold">Discount: <span className="text-gray-200">{book.Discount}%</span></p>
                                <p className="font-semibold">Used Price: <span className="text-gray-200">${usedPrice}</span></p>
                            </div>
                            <div className="text-xs text-gray-400">
                                <p>New: <span className="font-semibold text-gray-200">{book.NewOH}</span> in stock</p>
                                <p>Used: <span className="font-semibold text-gray-200">{book.UsedOH}</span> in stock</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex bg-gray-300 rounded-xl border border-white mx-4 p-2 max-h-[calc(25vh)]">
                <div className="flex relative w-full overflow-x-auto">
                    {book.Terms.length > 0 ?
                        <table className="w-full text-sm text-left rtl:text-right text-white text-center">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                <tr>
                                    {Object.keys(book.Terms[0]).map((header, index) => {
                                        return (
                                            <th key={index} className="p-2">
                                                {header}
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {book.Terms.map((term, index) => {
                                    return (
                                        <tr key={index} className="odd:bg-gray-900 even:bg-gray-800 hover:bg-gray-600 border-b border-gray-700">
                                            {Object.keys(term).map((data, index) => {
                                                return (
                                                    <td key={`${term["Term"]}${index}`} className="px-2 py-1">
                                                        {term[data]}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        :
                        <div className="flex text-sm justify-center text-black">
                            No Previous Terms Found
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}