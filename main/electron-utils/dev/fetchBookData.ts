import axios from "axios"
import { Book } from "../../../types/Book"
import LibraryResponse from "../../../types/LibraryResponse"
import { convertTitleCase, convertISBN13to10 } from "./"

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const fetchBookData = async (isbn13: string, salesData: Book, retryCount = 0) => {
    const RETRY_LIMIT = 2
    const RETRY_DELAY = 1000

    try {
        const response: LibraryResponse = await axios.get(`https://openlibrary.org/search.json?q=${isbn13}&fields=key,title,author_name,editions,publish_date,number_of_pages_median,publisher`)
        const data = response.data

        if (data.numFound > 0) {
            const book = data.docs[0]
            return {
                ...salesData,
                isbn_10: convertISBN13to10(isbn13),
                title: convertTitleCase(book.title),
                author: book.author_name ? book.author_name[0] : 'N/A',
                publisher: book.editions ? book.editions.docs[0].publisher ? book.editions.docs[0].publisher[0] : 'N/A' : 'N/A',
                publish_date: book.editions ? book.editions.docs[0].publish_date ? book.editions.docs[0].publish_date[0] : 'N/A' : 'N/A',
                number_of_pages: book.number_of_pages_median || 'N/A'
            }
        } else {
            return {
                ...salesData,
                isbn_10: convertISBN13to10(isbn13),
                title: 'N/A',
                author: 'N/A',
                publisher: 'N/A',
                publish_date: 'N/A',
                number_of_pages: 'N/A'
            }
        }
    } catch (error) {
        if (retryCount < RETRY_LIMIT) {
            if (error.response) {
                console.warn(`Status ${error.response.status} for ${isbn13} on try ${retryCount}`)
            }
            const expDelay = RETRY_DELAY * Math.pow(2, retryCount)
            await delay(expDelay)
            return fetchBookData(isbn13, salesData, retryCount + 1)
        } else {
            return {
                ...salesData,
                isbn_10: convertISBN13to10(isbn13),
                title: 'N/A',
                author: 'N/A',
                publisher: 'N/A',
                publish_date: 'N/A',
                number_of_pages: 'N/A'
            }
        }
    }
}
