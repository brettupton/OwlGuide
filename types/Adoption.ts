export type NoAdoption = {
    ID: number
    CRN: number
    Dept: string
    Course: string
    Section: string
    Prof: string
    Title: string
    NoText?: boolean
    ISBN?: string
    HasPrev?: boolean
}

export type AdoptionCSV = {
    'CampusName': string
    'TermTitle': string
    'SectionCode': string
    'ISBN': number
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