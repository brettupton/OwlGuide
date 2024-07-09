import React, { useState, useEffect } from 'react'
import { Book } from '../../../types/Book'
import SalesTable from '../../components/SalesTable'

export default function DecisionSales() {
    const [book, setBook] = useState<Book | undefined>()
    const [ISBN, setISBN] = useState<string>("")
    const [term, setTerm] = useState<string>("")

    useEffect(() => {
        window.ipc.on('isbn-data', ({ isbn, BDTerm, book }: { isbn: string, BDTerm: string, book: Book }) => {
            setBook({ ...book })
            setISBN(isbn)
            setTerm(BDTerm)
        })
    }, [])

    return (
        <React.Fragment>
            <div className="mt-5 ml-1">
                {book ?
                    <SalesTable ISBN={ISBN} Term={term} book={book} />
                    :
                    <div>No Book Data</div>
                }
            </div>
        </React.Fragment>
    )
}