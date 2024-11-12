export type Decision = {
    ISBN: number | string
    Title: string
    ActEnrl: number
    EstSales: number
    Decision: number
    Diff: number
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