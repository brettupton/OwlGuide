export type Decision = {
    ID: number
    ISBN: number | string
    Title: string
    EstEnrl: number
    ActEnrl: number
    EstSales: number
    EstDec: number
    ActDec: number
    ActDiff: number
}

export type SQLDecision = {
    BookID: number
    ISBN: number
    Title: string
    PrevEstEnrl: number
    PrevActEnrl: number
    PrevTotalSales: number
    CurrEstEnrl: number
    CurrActEnrl: number
    CurrEstSales: number
}

export type TableTab = "All" | "EQ0" | "GT5" | "LT5"

export type DecisionSales = {
    Term: string
    EstEnrl: number
    ActEnrl: number
    Sales: number
    'S/E'?: string | number
}