import { regex, bSQLDB } from '../utils'
import { apiSearch, formatBookSearch } from './helpers/bookSearch'

export const bookProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'search':
            try {
                const isbn = data as string
                const search = regex.createSearchISBN(isbn)
                // Query SQL DB for book term & vendor data
                const sqlResults = await bSQLDB.books.getBookByISBN(search)
                // Query Google API for book information data
                const apiResults = await apiSearch(isbn)
                // Join both results
                const book = formatBookSearch(sqlResults, apiResults)

                event.reply('book-data', { book })
            } catch (error) {
                console.error(error)
                throw error
            }
            break
    }
}