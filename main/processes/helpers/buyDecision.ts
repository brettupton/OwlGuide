import { Decision, SQLDecision } from "../../../types/Decision"
<<<<<<< HEAD
<<<<<<< HEAD
import { Features } from "../../../types/LGBModel"
import { regex, bSQLDB, forest } from "../../utils"

=======
import { regex, bSQLDB } from "../../utils"

/*
>>>>>>> main
=======
import { regex, bSQLDB } from "../../utils"

/*
>>>>>>> main
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
*/
>>>>>>> main
=======
*/
>>>>>>> main

const getTermDecisions = async (termYear: string) => {
    try {
        const [term, year] = regex.splitFullTerm(termYear)

        const termData = await bSQLDB.sales.getPrevSalesByTerm(term, year)
        let decisions: Decision[] = []

        termData.forEach((book) => {
<<<<<<< HEAD
<<<<<<< HEAD
            if (book["CurrEstSales"]) {

                const decision = calculateDecision(book as SQLDecision)
                decisions.push(decision)
            }
        })

        decisions = decisions.sort((a, b) => a.Title.localeCompare(b.Title))
=======
=======
>>>>>>> main
            const decision = calculateDecision(book as SQLDecision)
            decisions.push(decision)
        })

<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
        return decisions
    } catch (error) {
        throw error
    }
}

const calculateDecision = (book: SQLDecision) => {
<<<<<<< HEAD
<<<<<<< HEAD
    // Get previous semester sales over enrollment
    const salesEnrl = book.PrevActEnrl && (book.PrevActEnrl !== 0) ? book.PrevTotalSales / book.PrevActEnrl : 0.2

    // // If no current Actual Enrollment, calculate based on past percent change from Estimated to Actual
    // if (book.CurrActEnrl === 0 && book.CurrEstEnrl !== 0) {
    //     // Calculate previous percentage change as a multiplier
    //     const prevPerChange = book.PrevEstEnrl ? (book.PrevActEnrl - book.PrevEstEnrl) / book.PrevEstEnrl : 0

    //     // Apply the percentage change to current estimated enrollment
    //     book.CurrActEnrl = Math.round(book.CurrEstEnrl * (1 + prevPerChange))
    // }

    const newDec = Math.round(book.CurrActEnrl * salesEnrl)
    const newDecision: Decision = {
=======
=======
>>>>>>> main
    // Get previous semester sales over enrollment (default to 1/5 if no previous data)
    const salesEnrl = book.PrevActEnrl && (book.PrevActEnrl !== 0) ? book.PrevTotalSales / book.PrevActEnrl : 0.2

    // // If no current Actual Enrollment, calculate based on past percent change from Estimated to Actual
    /*
    if (book.CurrActEnrl === 0 && book.CurrEstEnrl !== 0) {
        // Calculate previous percentage change as a multiplier
        const prevPerChange = book.PrevEstEnrl ? (book.PrevActEnrl - book.PrevEstEnrl) / book.PrevEstEnrl : 0

        // Apply the percentage change to current estimated enrollment
        book.CurrActEnrl = Math.round(book.CurrEstEnrl * (1 + prevPerChange))
    }
        */


    const newDec = Math.round(book.CurrActEnrl * salesEnrl)
    const newDecision: Decision = {
        ID: book.BookID,
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
        ISBN: book.ISBN,
        Title: book.Title,
        EstEnrl: book.CurrEstEnrl,
        ActEnrl: book.CurrActEnrl,
        EstSales: book.CurrEstSales,
<<<<<<< HEAD
<<<<<<< HEAD
        Decision: newDec,
        Diff: Math.abs(book.CurrEstSales - newDec)
=======
        EstDec: Math.round(book.CurrEstEnrl * salesEnrl),
        ActDec: newDec,
        ActDiff: Math.abs(book.CurrEstSales - newDec)
>>>>>>> main
=======
        EstDec: Math.round(book.CurrEstEnrl * salesEnrl),
        ActDec: newDec,
        ActDiff: Math.abs(book.CurrEstSales - newDec)
>>>>>>> main
    }

    return newDecision
}

<<<<<<< HEAD
<<<<<<< HEAD
export { getTermDecisions, getDecisions }
=======
export { getTermDecisions }
>>>>>>> main
=======
export { getTermDecisions }
>>>>>>> main
