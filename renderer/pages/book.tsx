import { ChangeEvent, useEffect, useState } from "react"
import { BackArrow } from "../components"
import { BookResult } from "../../types/Book"
import BookDisplay from "../components/BookDisplay"

export default function BookPage() {
    const [searchISBN, setSearchISBN] = useState<string>("")
    const [resultBook, setResultBook] = useState<BookResult>()

    useEffect(() => {
        window.ipc.on('data', ({ book }: { book: BookResult }) => {
            setResultBook(book)
            setSearchISBN("")
        })
    }, [])

    const handleISBNChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget
        setSearchISBN(value)
        setResultBook(undefined)
    }

    const handleSearch = () => {
        window.ipc.send('book', { method: 'search', data: searchISBN })
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex items-center mx-auto mt-4">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative w-full">
                    <div className="absolute inset-y-0 start-0 flex items-center p-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <input type="text" id="search"
                        defaultValue={searchISBN}
                        onChange={handleISBNChange}
                        minLength={10}
                        maxLength={17}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full ps-8 p-2" placeholder="ISBN" />
                </div>
                <button onClick={handleSearch} className="p-2.5 ms-2 text-sm font-medium bg-white hover:bg-gray-300 text-gray-800 rounded-lg border focus:outline-none">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                    <span className="sr-only">Search</span>
                </button>
            </div>
            {resultBook ?
                Object.keys(resultBook).length > 0 ?
                    <BookDisplay book={resultBook} />
                    :
                    <div className="flex mt-2 text-rose-700 text-xs justify-center">No matching book found.</div>
                :
                <div></div>
            }
        </div>
    )
}