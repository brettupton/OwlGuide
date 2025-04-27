import { regex, bSQLDB } from '../utils'
import { apiSearch, formatBookSearch } from './helpers/bookSearch'

export const bookProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "book") {
        switch (method) {
            case 'search-isbn':
                try {
<<<<<<< HEAD
                    const reqISBN = data["isbn"]
                    const search = regex.createSearchISBN(reqISBN)
                    // Query SQL DB for book term & vendor data
                    const sqlResults = await bSQLDB.books.getBookByISBN(search)
                    // Query Google API for book information data
                    const apiResults = await apiSearch(reqISBN)
=======
                    const searchISBN = regex.formatSearchISBN(data["reqBook"]["isbn"])
                    // Query SQL DB for book term & vendor data
                    const sqlResults = await bSQLDB.books.getBookByISBN(searchISBN)
                    // Query Google API for book information data
                    const apiResults = await apiSearch(searchISBN)
>>>>>>> main
                    // Join both results
                    const book = formatBookSearch(sqlResults, apiResults)

                    event.reply('book-data', { book })
                } catch (error) {
<<<<<<< HEAD
                    console.error(error)
=======
                    throw error
                }
                break

            case 'search-title':
                try {
                    const searchResults = await bSQLDB.books.getBooksByTitle(data["reqBook"]["title"])
                    event.reply('title-data', { titles: searchResults })
                } catch (error) {
>>>>>>> main
                    throw error
                }
                break
        }
    }
}