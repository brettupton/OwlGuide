import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react"
import { BackArrow } from "../components"
import { BookResult } from "../../types/Book"
import BookDisplay from "../components/BookDisplay"
import { Button } from "../components/Button"

export default function BookPage() {
    const [searchBook, setSearchBook] = useState<{ isbn: string, title: string }>({ isbn: "", title: "" })
    const [resultBook, setResultBook] = useState<BookResult>()
<<<<<<< HEAD
    const [isInvalid, setIsInvalid] = useState<boolean>(false)
=======
    const [resultTitles, setResultTitles] = useState<{ [field: string]: string }[]>()
    const [filteredTitles, setFilteredTitles] = useState<{ [field: string]: string }[]>()
    const [isInvalid, setIsInvalid] = useState<boolean>(false)

    const tableRef: MutableRefObject<HTMLTableElement> = useRef(null)
>>>>>>> main

    useEffect(() => {
        window.ipc.on('book-data', ({ book }: { book: BookResult }) => {
            setResultBook(book)
<<<<<<< HEAD
            setSearchISBN("")
        })
=======
            setFilteredTitles(undefined)
        })

        window.ipc.on('title-data', ({ titles }: { titles: { [field: string]: string }[] }) => {
            setResultTitles([...titles])
            setFilteredTitles(titles.filter((book) => !(book["Title"].includes("EBK") || book["Publisher"] === "VST")))
        })

        setSearchBook({ isbn: "", title: "" })
>>>>>>> main
    }, [])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.currentTarget

        setSearchBook((prev) => {
            return {
                ...prev,
                [id]: value
            }
        })
        setResultBook(undefined)
<<<<<<< HEAD
        setIsInvalid(false)
    }

    const handleSearch = () => {
        if (!searchISBN || searchISBN.length < 10) {
            setIsInvalid(true)
            return
        }
<<<<<<< HEAD
        window.ipc.send('main', { process: 'book', method: 'search-isbn', data: { isbn: searchISBN } })
=======
        window.ipc.send('main', { process: 'book', method: 'search-isbn', data: { type: 'book', isbn: searchISBN } })
>>>>>>> main
=======
        setFilteredTitles(undefined)
        setIsInvalid(false)
    }

    const handleTitleClick = (isbn: string) => {
        window.ipc.send('main', { process: 'book', method: 'search-isbn', data: { type: 'book', reqBook: { isbn, title: "" } } })
        setResultBook(undefined)
        setFilteredTitles(undefined)
    }

    const handleFilterEbooks = (e: ChangeEvent<HTMLInputElement>) => {
        const includeEbooks = e.currentTarget.checked

        const filter = includeEbooks
            ? resultTitles
            : resultTitles.filter((book) => !(book["Title"].includes("EBK") || book["Publisher"] === "VST"))

        tableRef.current.scrollIntoView({ behavior: "smooth" })
        setFilteredTitles(filter)
    }

    const handleSearch = () => {
        if (!searchBook && searchBook["isbn"].length < 10 && searchBook["title"].length < 2) {
            setIsInvalid(true)
            return
        }
        setResultBook(undefined)
        setFilteredTitles(undefined)
        window.ipc.send('main', { process: 'book', method: `search-${searchBook["title"].length > 0 ? 'title' : 'isbn'}`, data: { type: 'book', reqBook: searchBook } })
>>>>>>> main
    }

    return (
        <div className="flex flex-col">
            <BackArrow />
            <div className="flex gap-3 items-center mx-auto w-2/3 mt-3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative w-1/2">
                    <div className="absolute inset-y-0 start-0 flex items-center p-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <input type="text"
                        id="isbn"
                        value={searchBook["isbn"]}
                        onChange={handleInputChange}
                        minLength={10}
                        maxLength={17}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full ps-8 px-2 py-1" placeholder="ISBN" />
                </div>
                <div className="relative w-full">
                    <div className="absolute inset-y-0 start-0 flex items-center p-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
<<<<<<< HEAD
                    <input type="text" id="search"
                        value={searchISBN}
                        onChange={handleISBNChange}
                        onKeyDown={(e) => e.key === "Enter" ? handleSearch() : ''}
                        minLength={10}
                        maxLength={17}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full ps-8 px-2 py-1" placeholder="ISBN" />
                </div>
<<<<<<< HEAD
                <button onClick={handleSearch}
                    className="p-2.5 ms-2 text-sm font-medium bg-white hover:bg-gray-300 text-gray-800 rounded-lg border focus:outline-none">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                    <span className="sr-only">Search</span>
                </button>
=======
=======
                    <input type="text"
                        id="title"
                        value={searchBook["title"]}
                        onChange={handleInputChange}
                        maxLength={40}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full ps-8 px-2 py-1" placeholder="Title" />
                </div>
>>>>>>> main
                <Button
                    parentComponent="book"
                    text="search"
                    isLoading={false}
                    icon="search"
<<<<<<< HEAD
                    isDisabled={(searchISBN.length <= 10)}
                    buttonCommand={handleSearch}
                />
>>>>>>> main
            </div>
            {isInvalid && <div className="flex items-center mx-auto mt-1 text-xs text-red-500">Invalid Search.</div>}
=======
                    isDisabled={(searchBook["isbn"].length < 10) && (searchBook["title"].length < 2)}
                    buttonCommand={handleSearch}
                />
            </div>
            {isInvalid && <div className="flex items-center mx-auto mt-1 text-xs text-red-500">Invalid Search.</div>}
            {filteredTitles ?
                filteredTitles.length > 0 ?
                    <div className="flex flex-col w-full px-4 py-2">
                        <div className="flex items-center mb-1">
                            <input
                                id="ebook-filter"
                                type="checkbox"
                                className="w-3.5 h-3.5 text-blue-600 rounded-sm focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
                                onChange={handleFilterEbooks}
                            />
                            <label htmlFor="ebook-filter" className="ms-1 text-sm font-medium">Include eBooks</label>
                        </div>
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-13.3rem)]">
                            <table className="w-full text-sm text-left rtl:text-right text-white table-auto" ref={tableRef}>
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                    <tr>
                                        {Object.keys(filteredTitles[0]).map((header) => {
                                            return (
                                                header !== "ID" &&
                                                <th className={`px-2 py-1`} key={header}>{header}</th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTitles.map((book) => {
                                        return (
                                            <tr
                                                className="odd:bg-gray-800 even:bg-gray-700 border-b border-gray-700 hover:bg-gray-600 hover:cursor-pointer"
                                                key={`${book["ID"]}`}
                                                onClick={() => handleTitleClick(book["ISBN"].toString())}
                                            >
                                                {Object.keys(book).map((key, index) => {
                                                    return (
                                                        key !== "ID" &&
                                                        <td
                                                            className={`px-2 py-1`}
                                                            key={`${book["ID"]}-${index}`}
                                                            id={`${book["ID"]}`}>
                                                            {key === "Title" ?
                                                                book["Title"].length > 36 ? book["Title"].slice(0, 36) + "..." : book["Title"]
                                                                :
                                                                key === "Author" ?
                                                                    book["Author"].length > 10 ? book["Author"].slice(0, 10) + "..." : book["Author"]
                                                                    :
                                                                    key === "Publisher" ?
                                                                        book["Publisher"].length > 8 ? book["Publisher"].slice(0, 8) + "..." : book["Publisher"]
                                                                        :
                                                                        book[key]
                                                            }
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end text-sm mt-1">{filteredTitles.length} Result(s)</div>
                    </div>
                    :
                    <div className="flex mt-2 text-red-500 text-xs justify-center">No matching titles found.</div>
                :
                <div></div>
            }
>>>>>>> main
            {resultBook ?
                Object.keys(resultBook).length > 0 ?
                    <BookDisplay book={resultBook} />
                    :
                    <div className="flex mt-2 text-red-500 text-xs justify-center">No matching book found.</div>
                :
                <div></div>
            }
        </div>
    )
}