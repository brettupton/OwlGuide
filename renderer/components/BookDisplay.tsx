import Image from "next/image"
import { BookResult } from "../../types/Book"

export default function BookDisplay({ book }: { book: BookResult }) {
    return (
        <div className="flex flex-col">
            <div className="flex bg-gray-300 rounded-xl border border-white m-4 p-3 text-black">
                <div className="flex">
                    <Image
                        src={`${book.Image ?? '/images/placeholder.jpg'}`}
                        width={130}
                        height={130}
                        alt="Book Thumbnail"
                    />
                </div>
                <div className="flex flex-col ml-2 w-full">
                    <div className="flex text-xl">{book.Title}</div>
                    <div className="flex">{book.ISBN}</div>
                    <div className="flex">{book.AuthorLast}</div>
                    <div className="flex">{book.Author}</div>
                    <div className="flex">{book.Edition}</div>
                    <div className="flex">{book.Vendor}</div>
                    <div className="flex">{book.Publisher}</div>
                    <div className="flex text-sm place-self-end translate-y-3 translate-x-1">{book.ID}</div>
                </div>
            </div>
            <div className="flex bg-gray-300 rounded-xl border border-white mx-4 p-3">
                <div className="flex relative max-h-[calc(50vh-6.5rem)] w-full overflow-x-auto">
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
                </div>
            </div>
        </div>
    )
}