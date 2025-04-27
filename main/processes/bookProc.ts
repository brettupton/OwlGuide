import { regex, bSQLDB } from '../utils'
import { apiSearch, formatBookSearch } from './helpers/bookSearch'

export const bookProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "book") {
        switch (method) {
            case 'search-isbn':
                try {
                    const searchISBN = regex.formatSearchISBN(data["reqBook"]["isbn"])
                    // Query SQL DB for book term & vendor data
                    const sqlResults = await bSQLDB.books.getBookByISBN(searchISBN)
                    // Query Google API for book information data
                    const apiResults = await apiSearch(searchISBN)
                    // Join both results
                    const book = formatBookSearch(sqlResults, apiResults)

                    event.reply('book-data', { book })
                } catch (error) {
                    throw error
                }
                break

            case 'search-title':
                try {
                    const searchResults = await bSQLDB.books.getBooksByTitle(data["reqBook"]["title"])
                    event.reply('title-data', { titles: searchResults })
                } catch (error) {
                    throw error
                }
                break
        }
    }
}