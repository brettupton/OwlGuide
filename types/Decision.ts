export type Decision = {
    ISBN: number | string
    Title: string
    ActEnrl: number
    EstSales: number
    Decision: number
    Diff: number
}

export type SQLDecision = {
    ISBN: number
    Title: string
    PrevEstEnrl: number
    PrevActEnrl: number
    CurrEstEnrl: number
    CurrActEnrl: number
    CurrEstSales: number
    Decision?: number
    TotalSales: number
}