import { Decision, SQLDecision } from "../../../types/Decision"
import { Features } from "../../../types/LGBModel"
import { regex, bSQLDB, forest } from "../../utils"

const getDecisions = async (term: string) => {
    try {
        const books = await bSQLDB.sales.getTermModelFeatures(term) as Features[]
        const predictions = await forest.getPredictions(books)
        const decisions: Decision[] = []

        for (let book of predictions) {
            decisions.push({
                ISBN: book.ISBN,
                Title: book.Title,
                EstEnrl: book.EstEnrl,
                ActEnrl: book.ActEnrl,
                EstSales: book.EstSales,
                Decision: Math.round(book.Prediction),
                Diff: Math.abs(book.EstSales - Math.round(book.Prediction))
            })
        }
        return decisions
    } catch (error) {
        throw error
    }
}

const getTermDecisions = async (fullTerm: string) => {
    try {
        const [term = null, year = null] = regex.splitFullTerm(fullTerm) || []
        if (!term || !year) throw `Unexpected term or year.`

        const termData = await bSQLDB.sales.getPrevSalesByTerm(term, year)
        let decisions: Decision[] = []

        termData.forEach((book) => {
            if (book["CurrEstSales"]) {

                const decision = calculateDecision(book as SQLDecision)
                decisions.push(decision)
            }
        })

        decisions = decisions.sort((a, b) => a.Title.localeCompare(b.Title))

        return { decisions, term: term + year }
    } catch (error) {
        throw error
    }
}

const calculateDecision = (book: SQLDecision) => {
    // Get previous semester sales over enrollment
    const salesEnrl = book.PrevActEnrl && (book.PrevActEnrl !== 0) ? book.PrevTotalSales / book.PrevActEnrl : 0.2

    // If no current Actual Enrollment, calculate based on past percent change from Estimated to Actual
    if (book.CurrActEnrl === 0 && book.CurrEstEnrl !== 0) {
        // Calculate previous percentage change as a multiplier
        const prevPerChange = book.PrevEstEnrl ? (book.PrevActEnrl - book.PrevEstEnrl) / book.PrevEstEnrl : 0

        // Apply the percentage change to current estimated enrollment
        book.CurrActEnrl = Math.round(book.CurrEstEnrl * (1 + prevPerChange))
    }

    const newDec = Math.round(book.CurrActEnrl * salesEnrl)
    const newDecision: Decision = {
        ISBN: book.ISBN,
        Title: book.Title,
        EstEnrl: book.CurrEstEnrl,
        ActEnrl: book.CurrActEnrl,
        EstSales: book.CurrEstSales,
        Decision: newDec,
        Diff: Math.abs(book.CurrEstSales - newDec)
    }

    return newDecision
}

export { getTermDecisions, getDecisions }