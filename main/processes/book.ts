import { BookResult, GVolInfo, APIResult } from "../../types/Book"
import axios from "axios"
import { regex } from "../utils"

const formatBookSearch = (sqlResults: DBRow[], apiResults: APIResult | {}) => {
    let book: BookResult | {} = {}
    if (sqlResults.length > 0) {
        // Convert all object values to proper case
        Object.keys(sqlResults[0]).forEach((key) => sqlResults[0][key] = regex.toProperCase(sqlResults[0][key]))
        const firstResult = sqlResults[0]
        book = {
            ID: firstResult["ID"] as number,
            ISBN: firstResult["ISBN"] || apiResults["ISBN"],
            Title: apiResults["Title"] || firstResult["Title"],
            Subtitle: apiResults["Subtitle"] || "",
            AuthorLast: firstResult["Author"],
            Author: apiResults["Author"] || "",
            Edition: firstResult["Edition"],
            Vendor: firstResult["Publisher"],
            Publisher: apiResults["Publisher"] || "",
            Image: apiResults["PreviewImg"],
            Terms: sqlResults.map((result) => {
                return {
                    Term: (result["Term"].toString()) + (result["Year"].toString()),
                    EstEnrl: result["EstEnrl"],
                    ActEnrl: result["ActEnrl"],
                    EstSales: result["EstSales"],
                    UsedSales: result["UsedSales"],
                    NewSales: result["NewSales"],
                    Reorders: result["Reorders"]
                }
            })
        }
    }
    return book
}

const apiSearch = async (isbn: string): Promise<APIResult | {}> => {
    try {
        let result: APIResult | {} = {}

        isbn = regex.usedBarcodeToISBN(isbn)
        const response = await
            axios.get('https://www.googleapis.com/books/v1/volumes',
                {
                    params: {
                        q: `isbn:${isbn}`,
                        key: process.env.GCLOUD_API_KEY
                    }
                }
            )
        if (response.status !== 200) {
            throw response.statusText
        }
        if (response.data.totalItems > 0) {
            const volInfo: GVolInfo = response.data.items[0].volumeInfo

            result["ISBN"] = volInfo["industryIdentifiers"] ? volInfo["industryIdentifiers"][0]["identifier"] : ""
            result["Title"] = volInfo["title"]
            result["Subtitle"] = volInfo["subtitle"]
            result["Author"] = volInfo["authors"].join(", ")
            result["Publisher"] = volInfo["publisher"]
            result["PreviewImg"] = volInfo["imageLinks"] ? volInfo["imageLinks"]["thumbnail"] : undefined
        }

        return result
    } catch (error) {
        throw error
    }
}

export { formatBookSearch, apiSearch }