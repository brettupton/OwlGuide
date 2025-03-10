export type NoAdoption = {
    ID: number
    CRN: number
    Dept: string
    Course: string
    Section: string
    Prof: string
    Title: string
    HasPrev: 0 | 1
    TempID?: number
    NoText?: boolean
    ISBN?: string
}

export type AdoptionCSV = {
    'CampusName': string
    'TermTitle': string
    'SectionCode': string
    'ISBN': string
    'SKU-First Day Sections Only': null
    'AdoptionCondition ( Non-First Day Sections Only)': string | null
    'AdoptionType ( Non-First Day Sections Only)': string | null
    'Notes': null
    'NoMaterials ( Non-First Day Sections Only "Y/N")': string
}

export type PrevAdoption = {
    Term: string
    Year: string
    Prof: string
    NoText: "Y" | "N"
    Book: string | null
    ISBN: string | null
}