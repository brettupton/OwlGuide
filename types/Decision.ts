export type Decision = {
    ISBN: string
    Title: string
    ActEnrl: number
    OldDecision: number
    NewDecision: number
    Diff: number
}

export type XLSXDecision = {
    Reg: number
    Store: number
    Unit: number
    Term: string
    Dept: number | string
    Course: number | string
    Prof: string
    Section: number | string
    'Crs ID': string
    Loc: string
    Author: string
    Title: string
    Publisher: string
    "EAN-13": string
    "Book #": number
    Rec: string
    FD: string
    Grp: string
    "Book Type": string
    "Cvr": string
    "Ed Sts": string
    "New Only": string
    Price: number
    Yuzu: boolean
    Rent: boolean
    Cap: number
    Enr: number
    "BD /\nCap": number | string
    "BD /\nEnr": number | string
    "Est Sales": number
    Decision: number
    Stock: number
    Code: number
    Reason: string
    OTB: number
    Reorders: number
    Hand: number
    Key: string
    Value: number
}