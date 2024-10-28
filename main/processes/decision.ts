import { Decision, XLSXDecision } from "../../types/Decision"
import { fileSys, sqlDB } from "../utils"

const getTermDecisions = async (fullTerm: string) => {
    const [term, year] = fullTerm.match(/[a-zA-z]|\d+/g)
    const termData = await sqlDB.getPrevSalesData(term, year)
    const decisions: Decision[] = []

    termData.forEach((book) => {
        const avgEstSales = book.PrevSales && (book.PrevEstEnrl as number) !== 0 ? ((book.PrevSales as number) / (book.PrevEstEnrl as number)).toFixed(4) : 0.2
        const avgActSales = book.PrevSales && (book.PrevActEnrl as number) !== 0 ? ((book.PrevSales as number) / (book.PrevActEnrl as number)).toFixed(4) : 0.2

        // const newDecision: Decision = {
        //     ISBN: book.ISBN as string,
        //     Title: book.Title as string,
        //     EstEnrl: book.CurrEstEnrl as number,
        //     ActEnrl: book.CurrActEnrl as number,
        //     EstDecision: Math.round((book.CurrEstEnrl as number) * (avgEstSales as number)),
        //     ActDecision: Math.round((book.CurrActEnrl as number) * (avgActSales as number))
        // }
        // decisions.push(newDecision)
    })

    return decisions
}

const getFileDecisions = async (filePath: string) => {
    try {
        const fileData: { [field: string]: string | number }[] = await fileSys.xlsx.read(filePath, "decision")

        const fileBooks: (string | number)[][] = []
        const fileTerm = fileData[0]["Term"].toString()
        const [term, year] = fileTerm.match(/[a-zA-z]|\d+/g)
        const fileDecisions: Decision[] = []

        fileData.forEach((decision) => {
            // Find only necessary values in file and force to expected type
            const store = Number(decision.Store)
            const isbn = decision["EAN-13"].toString()
            const title = decision["Title"].toString()
            const fileDec = Number(decision["Decision"])

            if (store !== 620) return

            // Aggregate decisions if multiple books are listed in sheet
            const existingBook = fileBooks.find(book => book[0] === isbn)
            if (!existingBook) {
                const newBook = [
                    isbn,
                    title,
                    fileDec
                ]
                fileBooks.push(newBook)
            } else {
                if (typeof existingBook[2] === 'number') {
                    existingBook[2] += fileDec
                }
            }
        })

        if (fileBooks.length > 0) {
            const termData = await sqlDB.getPrevSalesByBookArr(term, year, fileBooks)

            termData.forEach((book) => {
                const newDecision = calculateDecision(book)
                fileDecisions.push(newDecision)
            })

            return { decisions: fileDecisions, term: fileTerm }
        } else {
            throw "No buying decisions found for store."
        }
    } catch (error) {
        throw error
    }
}

const calculateDecision = (book) => {
    // Get previous semester sales over enrollment
    const salesEnrl = book.TotalSales && (book.PrevActEnrl !== 0) ? book.TotalSales / book.PrevActEnrl : 0.2

    // If no current Actual Enrollment, calculate based on past percent change from Estimated to Actual
    if (book.CurrActEnrl === 0 && book.CurrEstEnrl !== 0) {
        // Calculate previous percentage change as a multiplier
        const prevPerChange = book.PrevEstEnrl ? (book.PrevActEnrl - book.PrevEstEnrl) / book.PrevEstEnrl : 0;

        // Apply the percentage change to current estimated enrollment
        book.CurrActEnrl = Math.round(book.CurrEstEnrl * (1 + prevPerChange));
    }

    const newDec = Math.round(book.CurrActEnrl * salesEnrl)
    const newDecision: Decision = {
        ISBN: book.ISBN,
        Title: book.Title,
        ActEnrl: book.CurrActEnrl,
        OldDecision: book.Decision,
        NewDecision: newDec,
        Diff: Math.abs(book.Decision - newDec)
    }

    return newDecision
}

export { getTermDecisions, getFileDecisions }