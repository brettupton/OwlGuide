import fs from 'fs'
import path from 'path'
import { Book } from '../../types/Book'
import Sales from '../../types/Sales'

export class SalesService {
    private term: string
    private salesPath: string

    constructor(term: string) {
        this.term = term
        this.salesPath = path.join(__dirname, '..', 'resources', 'stores', `${global.store}`, 'sales', `${this.term}.json`)
    }

    public searchISBN(isbn: string): Promise<Book> {
        let book: Book = {
            semesters: {},
            total_est_enrl: 0,
            total_act_enrl: 0,
            total_est_sales: 0,
            total_act_sales: 0,
            total_reorders: 0,
            isbn_10: "",
            title: "No Prior Sales",
            author: "",
            publisher: "",
            publish_date: "",
            number_of_pages: 0
        }
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(this.salesPath, 'utf8', (err, salesData) => {
                    if (err) {
                        reject(`Something went wrong reading sales for store ${global.store} term ${this.term}`)
                    }
                    const allSalesData: Sales = JSON.parse(salesData)
                    if (allSalesData[isbn]) {
                        book = allSalesData[isbn]
                    }
                    resolve(book)
                })
            } catch (err) {
                reject(err)
            }
        })
    }
}